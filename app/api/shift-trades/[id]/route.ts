import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { status } = await req.json()

  try {
    const trade = await prisma.shiftTrade.findUnique({
      where: { id: params.id },
      include: { shift: true },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Shift trade not found' }, { status: 404 })
    }

    if (trade.targetUserId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedTrade = await prisma.shiftTrade.update({
      where: { id: params.id },
      data: { status },
    })

    if (status === 'ACCEPTED') {
      await prisma.shift.update({
        where: { id: trade.shiftId },
        data: { userId: trade.targetUserId },
      })
    }

    return NextResponse.json(updatedTrade)
  } catch (error) {
    console.error('Failed to update shift trade:', error)
    return NextResponse.json({ error: 'Failed to update shift trade' }, { status: 500 })
  }
}

