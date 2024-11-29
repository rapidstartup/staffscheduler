import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
  }

  try {
    const payrollData = await prisma.$queryRaw`
      SELECT 
        u.id AS "userId",
        u.name AS "userName",
        SUM(EXTRACT(EPOCH FROM (te."clockOut" - te."clockIn")) / 3600) AS "totalHours",
        SUM(EXTRACT(EPOCH FROM (te."clockOut" - te."clockIn")) / 3600 * p."wageRate") AS "totalPay"
      FROM 
        "User" u
        JOIN "TimeEntry" te ON u.id = te."userId"
        JOIN "Position" p ON u.id = p."userId"
      WHERE 
        te."clockIn" >= ${new Date(start)}
        AND te."clockOut" <= ${new Date(end)}
      GROUP BY 
        u.id, u.name
    `

    return NextResponse.json(payrollData)
  } catch (error) {
    console.error('Failed to fetch payroll data:', error)
    return NextResponse.json({ error: 'Failed to fetch payroll data' }, { status: 500 })
  }
}

