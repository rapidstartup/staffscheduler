import { createMocks } from 'node-mocks-http'
import { GET, POST } from '../../app/api/schedules/route'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'

jest.mock('@prisma/client')
jest.mock('next-auth/next')

describe('/api/schedules', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('GET /api/schedules should return schedules for the current user', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        startDate: '2023-06-19',
        endDate: '2023-06-25',
      },
    })

    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', name: 'John Doe' },
    })

    const mockPrismaClient = {
      shift: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: '1',
            userId: '1',
            date: new Date('2023-06-19'),
            startTime: '09:00',
            endTime: '17:00',
            isRecurring: false,
            recurringDays: [],
          },
        ]),
      },
    }

    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrismaClient)

    await GET(req)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual([
      {
        id: '1',
        userId: '1',
        date: '2023-06-19T00:00:00.000Z',
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: false,
        recurringDays: [],
      },
    ])
  })

  it('POST /api/schedules should create new shifts', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        shifts: [
          {
            userId: '1',
            date: '2023-06-19',
            startTime: '09:00',
            endTime: '17:00',
            isRecurring: false,
            recurringDays: [],
            locationId: 'location1',
          },
        ],
      },
    })

    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', name: 'John Doe', role: 'manager' },
    })

    const mockPrismaClient = {
      shift: {
        create: jest.fn().mockResolvedValue({
          id: '1',
          userId: '1',
          date: new Date('2023-06-19'),
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: false,
          recurringDays: [],
          locationId: 'location1',
        }),
      },
    }

    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrismaClient)

    await POST(req)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual([
      {
        id: '1',
        userId: '1',
        date: '2023-06-19T00:00:00.000Z',
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: false,
        recurringDays: [],
        locationId: 'location1',
      },
    ])
  })
})

