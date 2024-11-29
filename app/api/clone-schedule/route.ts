import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { addDays, format } from 'date-fns'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { weekStart, weekEnd } = await req.json()

  try {
    // Fetch shifts for the specified week
    const shiftsToClone = await prisma.shift.findMany({
      where: {
        date: {
          gte: new Date(weekStart),
          lte: new Date(weekEnd),
        },
      },
    })

    // Clone shifts for the next week
    const clonedShifts = await Promise.all(
      shiftsToClone.map(async (shift) => {
        const newShiftDate = addDays(new Date(shift.date), 7)
        return prisma.shift.create({
          data: {
            date: newShiftDate,
            startTime: shift.startTime,
            endTime: shift.endTime,
            locationId: shift.locationId,
            userId: shift.userId,
          },
        })
      })
    )

    return NextResponse.json(clonedShifts)
  } catch (error) {
    console.error('Failed to clone schedule:', error)
    return NextResponse.json({ error: 'Failed to clone schedule' }, { status: 500 })
  }
}

