import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { schedule } = await req.json()

  try {
    const startDate = new Date(schedule[0].date)
    const endDate = new Date(schedule[schedule.length - 1].date)

    await prisma.shift.deleteMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    await prisma.shift.createMany({
      data: schedule.map((shift: any) => ({
        userId: shift.userId,
        date: new Date(shift.date),
        startTime: shift.startTime,
        endTime: shift.endTime,
      })),
    })

    return NextResponse.json({ message: 'Schedule deployed successfully' })
  } catch (error) {
    console.error('Failed to deploy schedule:', error)
    return NextResponse.json({ error: 'Failed to deploy schedule' }, { status: 500 })
  }
}

