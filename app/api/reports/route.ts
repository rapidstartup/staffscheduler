import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user || (session.user.role !== 'manager' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reportType, startDate, endDate } = await req.json()

  try {
    let reportData

    switch (reportType) {
      case 'employeeHours':
        reportData = await generateEmployeeHoursReport(startDate, endDate)
        break
      case 'shiftCoverage':
        reportData = await generateShiftCoverageReport(startDate, endDate)
        break
      case 'overtimeAnalysis':
        reportData = await generateOvertimeAnalysisReport(startDate, endDate)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Failed to generate report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

async function generateEmployeeHoursReport(startDate: string, endDate: string) {
  const employeeHours = await prisma.timeEntry.groupBy({
    by: ['userId'],
    where: {
      startTime: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    _sum: {
      duration: true,
    },
  })

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: employeeHours.map(entry => entry.userId),
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  const labels = users.map(user => user.name)
  const data = users.map(user => {
    const hours = employeeHours.find(entry => entry.userId === user.id)?._sum.duration || 0
    return Math.round(hours / 60) // Convert minutes to hours
  })

  return {
    labels,
    datasets: [
      {
        label: 'Hours Worked',
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  }
}

async function generateShiftCoverageReport(startDate: string, endDate: string) {
  const shifts = await prisma.shift.findMany({
    where: {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  const dates = [...new Set(shifts.map(shift => shift.date.toISOString().split('T')[0]))]
  const coverage = dates.map(date => {
    const dayShifts = shifts.filter(shift => shift.date.toISOString().split('T')[0] === date)
    return (dayShifts.length / 24) * 100 // Assuming 24 hour coverage is 100%
  })

  return {
    labels: dates,
    datasets: [
      {
        label: 'Shift Coverage (%)',
        data: coverage,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }
}

async function generateOvertimeAnalysisReport(startDate: string, endDate: string) {
  const overtimeEntries = await prisma.timeEntry.groupBy({
    by: ['userId'],
    where: {
      startTime: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
      duration: {
        gt: 480, // Assuming 8 hours (480 minutes) is regular time
      },
    },
    _sum: {
      duration: true,
    },
  })

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: overtimeEntries.map(entry => entry.userId),
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  const labels = users.map(user => user.name)
  const data = users.map(user => {
    const overtime = overtimeEntries.find(entry => entry.userId === user.id)?._sum.duration || 0
    return Math.round((overtime - 480) / 60) // Convert minutes to hours, subtracting regular time
  })

  return {
    labels,
    datasets: [
      {
        label: 'Overtime Hours',
        data,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  }
}

