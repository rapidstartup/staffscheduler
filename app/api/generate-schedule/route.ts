import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { addDays, format, parseISO } from 'date-fns'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { parHours, startDate, endDate } = await req.json()

  try {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: { availability: true },
    })

    const existingShifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    })

    const generatedSchedule = generateAISchedule(employees, existingShifts, parHours, startDate, endDate)

    return NextResponse.json(generatedSchedule)
  } catch (error) {
    console.error('Failed to generate schedule:', error)
    return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 })
  }
}

function generateAISchedule(employees, existingShifts, parHours, startDate, endDate) {
  const generatedSchedule = []
  const currentDate = new Date(startDate)
  const endDateTime = new Date(endDate)

  while (currentDate <= endDateTime) {
    const dailyHours = { total: 0 }
    const availableEmployees = getAvailableEmployees(employees, currentDate)

    while (dailyHours.total < parHours && availableEmployees.length > 0) {
      const employee = selectBestEmployee(availableEmployees, dailyHours, parHours)
      const shift = createShift(employee, currentDate, dailyHours, parHours)
      
      if (shift) {
        generatedSchedule.push(shift)
        dailyHours.total += getShiftDuration(shift)
        dailyHours[employee.id] = (dailyHours[employee.id] || 0) + getShiftDuration(shift)
      }

      if (dailyHours[employee.id] >= 8) {
        availableEmployees.splice(availableEmployees.indexOf(employee), 1)
      }
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return generatedSchedule
}

function getAvailableEmployees(employees, date) {
  const dayOfWeek = format(date, 'EEEE').toLowerCase()
  return employees.filter(employee => 
    employee.availability.some(a => a.day.toLowerCase() === dayOfWeek)
  )
}

function selectBestEmployee(availableEmployees, dailyHours, parHours) {
  return availableEmployees.reduce((best, current) => {
    const bestHours = dailyHours[best.id] || 0
    const currentHours = dailyHours[current.id] || 0
    return currentHours < bestHours ? current : best
  })
}

function createShift(employee, date, dailyHours, parHours) {
  const availability = employee.availability.find(a => 
    a.day.toLowerCase() === format(date, 'EEEE').toLowerCase()
  )

  if (!availability) return null

  const [startHour, startMinute] = availability.startTime.split(':').map(Number)
  const [endHour, endMinute] = availability.endTime.split(':').map(Number)

  const shiftStart = new Date(date)
  shiftStart.setHours(startHour, startMinute)

  const shiftEnd = new Date(date)
  const maxShiftDuration = Math.min(8, parHours - dailyHours.total)
  shiftEnd.setHours(startHour + maxShiftDuration, startMinute)

  if (shiftEnd > new Date(date).setHours(endHour, endMinute)) {
    shiftEnd.setHours(endHour, endMinute)
  }

  return {
    userId: employee.id,
    date: format(date, 'yyyy-MM-dd'),
    startTime: format(shiftStart, 'HH:mm'),
    endTime: format(shiftEnd, 'HH:mm'),
  }
}

function getShiftDuration(shift) {
  const start = parseISO(`${shift.date}T${shift.startTime}`)
  const end = parseISO(`${shift.date}T${shift.endTime}`)
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

