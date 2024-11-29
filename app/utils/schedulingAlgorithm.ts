interface Staff {
  id: string
  name: string
  skills: string[]
  preferences: {
    maxHoursPerWeek: number
    preferredDays: string[]
  }
  availability: {
    [key: string]: string[] // e.g., { "Monday": ["9:00-17:00"] }
  }
}

interface Shift {
  id: string
  date: string
  startTime: string
  endTime: string
  requiredSkills: string[]
}

export function generateSchedule(staff: Staff[], shifts: Shift[]): { [key: string]: string } {
  const schedule: { [key: string]: string } = {}

  // Sort shifts by date and time
  shifts.sort((a, b) => new Date(a.date + ' ' + a.startTime).getTime() - new Date(b.date + ' ' + b.startTime).getTime())

  for (const shift of shifts) {
    let bestStaff: Staff | null = null
    let bestScore = -Infinity

    for (const employee of staff) {
      const score = calculateScore(employee, shift)
      if (score > bestScore) {
        bestScore = score
        bestStaff = employee
      }
    }

    if (bestStaff) {
      schedule[shift.id] = bestStaff.id
    }
  }

  return schedule
}

function calculateScore(employee: Staff, shift: Shift): number {
  let score = 0

  // Check if employee has all required skills
  const hasAllSkills = shift.requiredSkills.every(skill => employee.skills.includes(skill))
  if (!hasAllSkills) return -Infinity

  // Check if employee is available for this shift
  const shiftDay = new Date(shift.date).toLocaleString('en-us', { weekday: 'long' })
  const isAvailable = employee.availability[shiftDay]?.some(timeRange => {
    const [availStart, availEnd] = timeRange.split('-')
    return availStart <= shift.startTime && shift.endTime <= availEnd
  })
  if (!isAvailable) return -Infinity

  // Preferred days bonus
  if (employee.preferences.preferredDays.includes(shiftDay)) {
    score += 10
  }

  // Skill match bonus
  score += shift.requiredSkills.filter(skill => employee.skills.includes(skill)).length

  return score
}

