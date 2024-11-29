import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { sendNotification } from '../../../../server/websocket'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { date, startTime, endTime, userId } = await req.json()

  try {
    const shift = await prisma.shift.update({
      where: { id: params.id },
      data: {
        date: new Date(date),
        startTime,
        endTime,
        userId,
      },
    })

    // Send real-time notification
    sendNotification(userId, `Your shift on ${date} has been updated`)

    return NextResponse.json(shift)
  } catch (error) {
    console.error('Failed to update shift:', error)
    return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 })
  }
}

