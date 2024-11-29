import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session || !session.user || (session.user.role !== 'manager' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.leavePolicy.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: 'Leave policy deleted successfully' })
  } catch (error) {
    console.error('Failed to delete leave policy:', error)
    return NextResponse.json({ error: 'Failed to delete leave policy' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session || !session.user || (session.user.role !== 'manager' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { leaveType, daysPerYear, accrualRate, carryOver } = await req.json()

  try {
    const updatedPolicy = await prisma.leavePolicy.update({
      where: { id: params.id },
      data: {
        leaveType,
        daysPerYear,
        accrualRate,
        carryOver,
      },
    })
    return NextResponse.json(updatedPolicy)
  } catch (error) {
    console.error('Failed to update leave policy:', error)
    return NextResponse.json({ error: 'Failed to update leave policy' }, { status: 500 })
  }
}

