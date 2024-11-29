import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const trades = await prisma.shiftTrade.findMany({
      where: {
        OR: [
          { requestorId: session.user.id },
          { targetUserId: session.user.id },
        ],
      },
      include: {
        requestor: { select: { name: true } },
        targetUser: { select: { name: true } },
        shift: true,
      },
    })
    return NextResponse.json(trades)
  } catch (error) {
    console.error('Failed to fetch shift trades:', error)
    return NextResponse.json({ error: 'Failed to fetch shift trades' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { shiftId, targetUserId, reason } = await req.json()

  try {
    const trade = await prisma.shiftTrade.create({
      data: {
        requestorId: session.user.id,
        targetUserId,
        shiftId,
        reason,
        status: 'PENDING',
      },
    })
    return NextResponse.json(trade)
  } catch (error) {
    console.error('Failed to create shift trade:', error)
    return NextResponse.json({ error: 'Failed to create shift trade' }, { status: 500 })
  }
}

