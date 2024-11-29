import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getUserAvailability() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'EMPLOYEE' },
      include: { availability: true },
    })

    const availability: Record<string, { day: string; startTime: string; endTime: string }[]> = {}
    users.forEach(user => {
      availability[user.id] = user.availability.map(a => ({
        day: a.day,
        startTime: a.startTime,
        endTime: a.endTime
      }))
    })

    return availability
  } catch (error) {
    console.error('Error fetching user availability:', error)
    throw error
  }
}

