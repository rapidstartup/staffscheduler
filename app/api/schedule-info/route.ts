import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [upcomingShifts, totalHours, pendingRequests] = await Promise.all([
      prisma.shift.count({
        where: {
          userId: session.user.id,
          startTime: { gte: now, lt: oneWeekFromNow },
        },
      }),
      prisma.timeEntry.aggregate({
        where: {
          userId: session.user.id,
          clockIn: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
        _sum: {
          clockOut: true,
          clockIn: true,
        },
      }),
      prisma.leaveRequest.count({
        where: {
          userId: session.user.id,
          status: 'pending',
        },
      }),
    ])

    const totalMilliseconds = 
      (totalHours._sum.clockOut?.getTime() ?? 0) - (totalHours._sum.clockIn?.getTime() ?? 0)
    const totalHoursWorked = Math.round(totalMilliseconds / (1000 * 60 * 60) * 10) / 10

    return NextResponse.json({
      upcomingShifts,
      totalHours: totalHoursWorked,
      pendingRequests,
    })
  } catch (error) {
    console.error('Failed to fetch schedule info:', error)
    return NextResponse.json({ error: 'Failed to fetch schedule info' }, { status: 500 })
  }
}

