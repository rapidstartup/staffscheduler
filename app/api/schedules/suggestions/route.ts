import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { generateAdvancedScheduleSuggestions } from '../../../utils/scheduleSuggestions'
import { startOfWeek, parseISO } from 'date-fns'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session || !session.user || session.user.role !== 'manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const weekStart = searchParams.get('weekStart')

  if (!weekStart) {
    return NextResponse.json({ error: 'Week start date is required' }, { status: 400 })
  }

  try {
    const suggestions = await generateAdvancedScheduleSuggestions(startOfWeek(parseISO(weekStart)))
    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Failed to generate advanced schedule suggestions:', error)
    return NextResponse.json({ error: 'Failed to generate advanced schedule suggestions' }, { status: 500 })
  }
}

