import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { shifts } = await req.json()

  try {
    const updatedShifts = await prisma.$transaction(
      shifts.map((shift: any) =>
        prisma.shift.update({
          where: { id: shift.id },
          data: {
            userId: shift.userId,
            date: new Date(shift.date),
            startTime: shift.startTime,
            endTime: shift.endTime,
          },
        })
      )
    )
    return NextResponse.json(updatedShifts)
  } catch (error) {
    console.error('Failed to update schedule:', error)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}

