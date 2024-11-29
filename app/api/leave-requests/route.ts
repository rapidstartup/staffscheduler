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
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: session.user.role === 'manager' ? {} : { userId: session.user.id },
      orderBy: { startDate: 'desc' }
    })
    return NextResponse.json(leaveRequests)
  } catch (error) {
    console.error('Failed to fetch leave requests:', error)
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { startDate, endDate, reason, type } = await req.json()

  try {
    const newLeaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: session.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        type,
        status: 'PENDING'
      }
    })
    return NextResponse.json(newLeaveRequest)
  } catch (error) {
    console.error('Failed to create leave request:', error)
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 })
  }
}

