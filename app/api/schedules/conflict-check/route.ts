import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { isSameDay, parseISO, isWithinInterval } from 'date-fns'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { shifts } = await req.json()

  try {
    const conflicts = []

    for (const shift of shifts) {
      const shiftStart = parseISO(`${shift.date}T${shift.startTime}`)
      const shiftEnd = parseISO(`${shift.date}T${shift.endTime}`)

      // Check for overlapping shifts
      const overlappingShifts = await prisma.shift.findMany({
        where: {
          userId: shift.userId,
          OR: [
            {
              date: new Date(shift.date),
              startTime: { lte: shift.endTime },
              endTime: { gte: shift.startTime },
            },
            {
              isRecurring: true,
              recurringDays: {
                has: new Date(shift.date).getDay(),
              },
            },
          ],
        },
      })

      const conflictingShifts = overlappingShifts.filter(existingShift => {
        if (existingShift.id === shift.id) return false // Skip the current shift

        const existingShiftStart = parseISO(`${existingShift.date.toISOString().split('T')[0]}T${existingShift.startTime}`)
        const existingShiftEnd = parseISO(`${existingShift.date.toISOString().split('T')[0]}T${existingShift.endTime}`)

        return (
          isWithinInterval(shiftStart, { start: existingShiftStart, end: existingShiftEnd }) ||
          isWithinInterval(shiftEnd, { start: existingShiftStart, end: existingShiftEnd }) ||
          isWithinInterval(existingShiftStart, { start: shiftStart, end: shiftEnd })
        )
      })

      if (conflictingShifts.length > 0) {
        conflicts.push({
          shift,
          conflictingShifts,
        })
      }

      // Check for time-off requests
      const timeOffRequests = await prisma.leaveRequest.findMany({
        where: {
          userId: shift.userId,
          status: 'approved',
          startDate: { lte: new Date(shift.date) },
          endDate: { gte: new Date(shift.date) },
        },
      })

      if (timeOffRequests.length > 0) {
        conflicts.push({
          shift,
          timeOffRequests,
        })
      }
    }

    return NextResponse.json({ conflicts })
  } catch (error) {
    console.error('Failed to check for conflicts:', error)
    return NextResponse.json({ error: 'Failed to check for conflicts' }, { status: 500 })
  }
}

