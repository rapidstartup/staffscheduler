import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user || (session.user.role !== 'manager' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const policies = await prisma.leavePolicy.findMany()
    return NextResponse.json(policies)
  } catch (error) {
    console.error('Failed to fetch leave policies:', error)
    return NextResponse.json({ error: 'Failed to fetch leave policies' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user || (session.user.role !== 'manager' && session.user.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { leaveType, daysPerYear, accrualRate, carryOver } = await req.json()

  try {
    const newPolicy = await prisma.leavePolicy.create({
      data: {
        leaveType,
        daysPerYear,
        accrualRate,
        carryOver,
      },
    })
    return NextResponse.json(newPolicy)
  } catch (error) {
    console.error('Failed to create leave policy:', error)
    return NextResponse.json({ error: 'Failed to create leave policy' }, { status: 500 })
  }
}

