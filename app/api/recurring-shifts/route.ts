import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const recurringShifts = await prisma.shift.findMany({
      where: {
        isRecurring: true,
      },
      select: {
        id: true,
        userId: true,
        startTime: true,
        endTime: true,
        recurringDays: true,
        recurringFrequency: true,
        recurringEndDate: true,
      },
    })
    return NextResponse.json(recurringShifts)
  } catch (error) {
    console.error('Failed to fetch recurring shifts:', error)
    return NextResponse.json({ error: 'Failed to fetch recurring shifts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, startTime, endTime, recurringDays, recurringFrequency, recurringEndDate } = await req.json()

  try {
    const newRecurringShift = await prisma.shift.create({
      data: {
        userId,
        date: new Date(), // Set a default date
        startTime,
        endTime,
        isRecurring: true,
        recurringDays,
        recurringFrequency,
        recurringEndDate: new Date(recurringEndDate),
        locationId: 'default-location-id', // Replace with actual location ID
      },
    })
    return NextResponse.json(newRecurringShift)
  } catch (error) {
    console.error('Failed to create recurring shift:', error)
    return NextResponse.json({ error: 'Failed to create recurring shift' }, { status: 500 })
  }
}

