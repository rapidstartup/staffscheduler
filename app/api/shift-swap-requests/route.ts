import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { shiftId, reason } = await req.json()

  try {
    const swapRequest = await prisma.shiftSwapRequest.create({
      data: {
        shiftId,
        requestorId: session.user.id,
        reason,
        status: 'PENDING',
      },
    })

    return NextResponse.json(swapRequest)
  } catch (error) {
    console.error('Failed to create shift swap request:', error)
    return NextResponse.json({ error: 'Failed to create shift swap request' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const swapRequests = await prisma.shiftSwapRequest.findMany({
      where: {
        OR: [
          { requestorId: session.user.id },
          { shift: { userId: session.user.id } },
        ],
      },
      include: {
        shift: true,
        requestor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(swapRequests)
  } catch (error) {
    console.error('Failed to fetch shift swap requests:', error)
    return NextResponse.json({ error: 'Failed to fetch shift swap requests' }, { status: 500 })
  }
}

