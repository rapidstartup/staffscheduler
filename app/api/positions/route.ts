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
    const positions = await prisma.position.findMany({
      where: { userId: session.user.id },
    })
    return NextResponse.json(positions)
  } catch (error) {
    console.error('Failed to fetch positions:', error)
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, wageType, wageRate } = await req.json()

  try {
    const newPosition = await prisma.position.create({
      data: {
        title,
        wageType,
        wageRate,
        userId: session.user.id,
      },
    })
    return NextResponse.json(newPosition)
  } catch (error) {
    console.error('Failed to create position:', error)
    return NextResponse.json({ error: 'Failed to create position' }, { status: 500 })
  }
}

