import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { authenticator } from 'otplib'

const prisma = new PrismaClient()

export async function POST() {
  const session = await getServerSession()

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const secret = authenticator.generateSecret()
  const otpauth = authenticator.keyuri(user.email!, 'StaffScheduler', secret)

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: secret },
  })

  return NextResponse.json({ secret, otpauth })
}

