import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { addHours, format } from 'date-fns'
import webpush from 'web-push'

const prisma = new PrismaClient()

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function GET() {
  try {
    const now = new Date()
    const oneHourFromNow = addHours(now, 1)

    // Find shifts starting within the next hour
    const upcomingShifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: now,
          lt: oneHourFromNow,
        },
      },
      include: {
        user: true,
        location: true,
      },
    })

    // Send notifications for each upcoming shift
    for (const shift of upcomingShifts) {
      const subscription = await prisma.pushSubscription.findFirst({
        where: { userId: shift.userId },
      })

      if (subscription) {
        const payload = JSON.stringify({
          title: 'Upcoming Shift Reminder',
          body: `Your shift at ${shift.location.name} starts in 1 hour at ${format(new Date(shift.date), 'h:mm a')}`,
        })

        await webpush.sendNotification(JSON.parse(subscription.subscription), payload)
      }
    }

    return NextResponse.json({ message: 'Notifications sent successfully' })
  } catch (error) {
    console.error('Failed to send notifications:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}

