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

  const url = new URL(req.url!)
  const code = url.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { googleRefreshToken: tokens.refresh_token }
    })

    return NextResponse.redirect('/dashboard')
  } catch (error) {
    console.error('Error getting Google OAuth tokens:', error)
    return NextResponse.json({ error: 'Failed to authenticate with Google' }, { status: 500 })
  }
}

