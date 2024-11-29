import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import webpush from 'web-push'

const prisma = new PrismaClient()

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscription = await req.json()

  try {
    await prisma.pushSubscription.create({
      data: {
        userId: session.user.id,
        subscription: JSON.stringify(subscription),
      },
    })
    return NextResponse.json({ message: 'Subscription added successfully' })
  } catch (error) {
    console.error('Failed to add push subscription:', error)
    return NextResponse.json({ error: 'Failed to add push subscription' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.pushSubscription.deleteMany({
      where: { userId: session.user.id },
    })
    return NextResponse.json({ message: 'Subscription removed successfully' })
  } catch (error) {
    console.error('Failed to remove push subscription:', error)
    return NextResponse.json({ error: 'Failed to remove push subscription' }, { status: 500 })
  }
}

