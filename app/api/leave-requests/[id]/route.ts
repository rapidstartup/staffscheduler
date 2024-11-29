import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession()
  if (!session || !session.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { status } = await req.json()

  try {
    const updatedLeaveRequest = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: { status }
    })
    return NextResponse.json(updatedLeaveRequest)
  } catch (error) {
    console.error('Failed to update leave request:', error)
    return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 })
  }
}

