import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
  }

  try {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const regularShifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
        isRecurring: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const recurringShifts = await prisma.shift.findMany({
      where: {
        isRecurring: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const expandedRecurringShifts = recurringShifts.flatMap(shift => {
      return eachDayOfInterval({ start, end })
        .filter(date => shift.recurringDays.includes(date.getDay()))
        .map(date => ({
          ...shift,
          date: date.toISOString(),
        }))
    })

    const allShifts = [...regularShifts, ...expandedRecurringShifts]

    return NextResponse.json(allShifts)
  } catch (error) {
    console.error('Failed to fetch schedule:', error)
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { shifts } = await req.json()

  try {
    const createdShifts = await prisma.$transaction(
      shifts.map((shift: any) =>
        prisma.shift.create({
          data: {
            userId: shift.userId,
            date: new Date(shift.date),
            startTime: shift.startTime,
            endTime: shift.endTime,
            isRecurring: shift.isRecurring,
            recurringDays: shift.recurringDays,
            locationId: shift.locationId,
          },
        })
      )
    )
    return NextResponse.json(createdShifts)
  } catch (error) {
    console.error('Failed to create schedule:', error)
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 })
  }
}

