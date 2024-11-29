import { generateAdvancedScheduleSuggestions } from '../../app/utils/scheduleSuggestions'
import { PrismaClient } from '@prisma/client'

jest.mock('@prisma/client')

describe('generateAdvancedScheduleSuggestions', () => {
  it('should generate schedule suggestions based on staff preferences and skills', async () => {
    const mockPrismaClient = {
      user: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: '1',
            name: 'John Doe',
            positions: [{ title: 'Cashier' }],
            availability: { Monday: ['09:00-17:00'] },
            preferences: {
              preferredShifts: ['morning'],
              preferredDays: ['Monday'],
            },
            skills: ['customer service'],
            maxHoursPerWeek: 40,
          },
        ]),
      },
      shiftRequirement: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: '1',
            date: '2023-06-19',
            startTime: '09:00',
            endTime: '17:00',
            position: 'Cashier',
            requiredSkills: ['customer service'],
            priority: 1,
            locationId: 'location1',
          },
        ]),
      },
    }

    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrismaClient)

    const suggestions = await generateAdvancedScheduleSuggestions(new Date('2023-06-19'))

    expect(suggestions).toHaveLength(1)
    expect(suggestions[0]).toMatchObject({
      userId: '1',
      date: expect.any(Date),
      startTime: '09:00',
      endTime: '17:00',
      locationId: 'location1',
    })
  })
})

