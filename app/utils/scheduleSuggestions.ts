import { PrismaClient, User, Shift, Position, ShiftRequirement } from '@prisma/client'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, parseISO, differenceInHours } from 'date-fns'

const prisma = new PrismaClient()

type StaffMember = User & {
  positions: Position[]
  availability: {
    [key: string]: string[] // e.g., { "Monday": ["09:00-17:00"] }
  }
  preferences: {
    preferredShifts: string[] // e.g., ["morning", "afternoon", "evening"]
    preferredDays: string[] // e.g., ["Monday", "Wednesday", "Friday"]
  }
  skills: string[]
  maxHoursPerWeek: number
}

export async function generateAdvancedScheduleSuggestions(weekStart: Date): Promise<Shift[]> {
  const weekEnd = endOfWeek(weekStart)
  
  // Fetch all staff members with their positions, availability, preferences, and skills
  const staffMembers = await prisma.user.findMany({
    where: { role: 'staff' },
    include: {
      positions: true,
    }
  }) as StaffMember[]

  // Fetch shift requirements for the week
  const shiftRequirements = await prisma.shiftRequirement.findMany({
    where: {
      date: {
        gte: weekStart,
        lte: weekEnd,
      }
    }
  })

  const suggestedSchedule: Shift[] = []

  // Sort shift requirements by priority (you may need to add a priority field to ShiftRequirement)
  const sortedRequirements = shiftRequirements.sort((a, b) => b.priority - a.priority)

  for (const requirement of sortedRequirements) {
    const availableStaff = staffMembers.filter(staff => 
      isStaffAvailable(staff, requirement) &&
      hasRequiredPosition(staff, requirement.position) &&
      hasRequiredSkills(staff, requirement.requiredSkills) &&
      !exceedsWeeklyHours(staff, suggestedSchedule, requirement)
    )

    if (availableStaff.length > 0) {
      // Score each available staff member based on preferences and other factors
      const scoredStaff = availableStaff.map(staff => ({
        staff,
        score: calculateStaffScore(staff, requirement, suggestedSchedule)
      }))

      // Sort staff by score in descending order
      scoredStaff.sort((a, b) => b.score - a.score)

      // Select the highest-scoring staff member
      const selectedStaff = scoredStaff[0].staff

      suggestedSchedule.push({
        id: `suggested-${suggestedSchedule.length}`,
        userId: selectedStaff.id,
        date: new Date(requirement.date),
        startTime: requirement.startTime,
        endTime: requirement.endTime,
        locationId: requirement.locationId,
        isRecurring: false,
        recurringDays: [],
      })
    }
  }

  return suggestedSchedule
}

function isStaffAvailable(staff: StaffMember, requirement: ShiftRequirement): boolean {
  const dayOfWeek = format(parseISO(requirement.date), 'EEEE')
  const availableSlots = staff.availability[dayOfWeek] || []
  return availableSlots.some(slot => {
    const [start, end] = slot.split('-')
    return start <= requirement.startTime && end >= requirement.endTime
  })
}

function hasRequiredPosition(staff: StaffMember, requiredPosition: string): boolean {
  return staff.positions.some(position => position.title === requiredPosition)
}

function hasRequiredSkills(staff: StaffMember, requiredSkills: string[]): boolean {
  return requiredSkills.every(skill => staff.skills.includes(skill))
}

function exceedsWeeklyHours(staff: StaffMember, currentSchedule: Shift[], newShift: ShiftRequirement): boolean {
  const totalHours = getScheduledHours(staff, currentSchedule) + getShiftHours(newShift)
  return totalHours > staff.maxHoursPerWeek
}

function getScheduledHours(staff: StaffMember, schedule: Shift[]): number {
  return schedule
    .filter(shift => shift.userId === staff.id)
    .reduce((total, shift) => total + getShiftHours(shift), 0)
}

function getShiftHours(shift: Shift | ShiftRequirement): number {
  const start = parseISO(`1970-01-01T${shift.startTime}`)
  const end = parseISO(`1970-01-01T${shift.endTime}`)
  return differenceInHours(end, start)
}

function calculateStaffScore(staff: StaffMember, requirement: ShiftRequirement, currentSchedule: Shift[]): number {
  let score = 0

  // Preferred shift time
  const shiftTime = getShiftTime(requirement.startTime)
  if (staff.preferences.preferredShifts.includes(shiftTime)) {
    score += 2
  }

  // Preferred day
  const dayOfWeek = format(parseISO(requirement.date), 'EEEE')
  if (staff.preferences.preferredDays.includes(dayOfWeek)) {
    score += 2
  }

  // Skill match (more matches = higher score)
  const skillMatchCount = requirement.requiredSkills.filter(skill => staff.skills.includes(skill)).length
  score += skillMatchCount

  // Fairness (less hours scheduled = higher score)
  const scheduledHours = getScheduledHours(staff, currentSchedule)
  score += 10 - Math.floor(scheduledHours / 8) // Assuming 8-hour shifts, adjust as needed

  return score
}

function getShiftTime(startTime: string): string {
  const hour = parseInt(startTime.split(':')[0])
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

