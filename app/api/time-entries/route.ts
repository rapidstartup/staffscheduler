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
    const timeEntries = await prisma.timeEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { startTime: 'desc' },
      take: 10
    })
    return NextResponse.json(timeEntries)
  } catch (error) {
    console.error('Failed to fetch time entries:', error)
    return NextResponse.json({ error: 'Failed to fetch time entries' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { locationId } = await req.json()

  try {
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    })

    if (!location) {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 })
    }

    const newTimeEntry = await prisma.timeEntry.create({
      data: {
        userId: session.user.id,
        locationId: locationId,
        startTime: new Date()
      }
    })

    return NextResponse.json(newTimeEntry)
  } catch (error) {
    console.error('Failed to create time entry:', error)
    return NextResponse.json({ error: 'Failed to create time entry' }, { status: 500 })
  }
}

