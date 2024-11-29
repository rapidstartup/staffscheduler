import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/calendar/google/callback`
)

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { googleRefreshToken: true }
  })

  if (!user?.googleRefreshToken) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events']
    })
    return NextResponse.json({ authUrl })
  }

  oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  try {
    const shifts = await prisma.shift.findMany({
      where: { userId: session.user.id },
      include: { location: true }
    })

    for (const shift of shifts) {
      await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: `Work Shift at ${shift.location.name}`,
          description: `Work shift from ${shift.startTime} to ${shift.endTime}`,
          start: {
            dateTime: `${shift.date}T${shift.startTime}:00`,
            timeZone: 'UTC',
          },
          end: {
            dateTime: `${shift.date}T${shift.endTime}:00`,
            timeZone: 'UTC',
          },
        },
      })
    }

    return NextResponse.json({ message: 'Shifts synced to Google Calendar' })
  } catch (error) {
    console.error('Error syncing with Google Calendar:', error)
    return NextResponse.json({ error: 'Failed to sync with Google Calendar' }, { status: 500 })
  }
}

