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
    const shifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    const distribution: { [key: string]: number } = {}

    shifts.forEach((shift) => {
      const userName = shift.user.name
      distribution[userName] = (distribution[userName] || 0) + 1
    })

    return NextResponse.json(distribution)
  } catch (error) {
    console.error('Failed to fetch shift distribution:', error)
    return NextResponse.json({ error: 'Failed to fetch shift distribution' }, { status: 500 })
  }
}

