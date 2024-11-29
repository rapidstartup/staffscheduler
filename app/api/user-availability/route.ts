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
    const users = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: { availability: true },
    })

    const availability: Record<string, string[]> = {}
    users.forEach(user => {
      availability[user.id] = user.availability.map(a => `${a.day}: ${a.startTime} - ${a.endTime}`)
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Failed to fetch user availability:', error)
    return NextResponse.json({ error: 'Failed to fetch user availability' }, { status: 500 })
  }
}

