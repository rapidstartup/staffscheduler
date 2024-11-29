import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, subMonths } from 'date-fns'

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession()
  if (!session || !session.user || (session.user.role !== 'manager' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)

    // Fetch weekly hours
    const weeklyHours = await prisma.timeEntry.groupBy({
      by: ['userId'],
      where: {
        startTime: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      _sum: {
        duration: true,
      },
    })

    const weeklyHoursData = Object.fromEntries(
      weeklyHours.map((entry) => [entry.userId, entry._sum.duration || 0])
    )

    // Fetch department distribution
    const departmentDistribution = await prisma.user.groupBy({
      by: ['department'],
      _count: {
        _all: true,
      },
    })

    const departmentDistributionData = Object.fromEntries(
      departmentDistribution.map((entry) => [entry.department, entry._count._all])
    )

    // Fetch monthly trends (last 6 months)
    const sixMonthsAgo = subMonths(now, 6)
    const monthlyTrends = await prisma.timeEntry.groupBy({
      by: ['userId'],
      where: {
        startTime: {
          gte: sixMonthsAgo,
        },
      },
      _sum: {
        duration: true,
      },
    })

    const monthlyTrendsData = Object.fromEntries(
      monthlyTrends.map((entry) => [entry.userId, entry._sum.duration || 0])
    )

    return NextResponse.json({
      weeklyHours: weeklyHoursData,
      departmentDistribution: departmentDistributionData,
      monthlyTrends: monthlyTrendsData,
    })
  } catch (error) {
    console.error('Failed to fetch analytics data:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}

