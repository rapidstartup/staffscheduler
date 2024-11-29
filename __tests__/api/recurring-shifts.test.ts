import { NextApiRequest, NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'
import { GET, POST } from '@/app/api/recurring-shifts/route'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

jest.mock('next-auth/next')
jest.mock('@prisma/client')

describe('/api/recurring-shifts', () => {
  it('returns 401 for unauthenticated requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    })

    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    await GET(req)

    expect(res._getStatusCode()).toBe(401)
    expect(JSON.parse(res._getData())).toEqual({ error: 'Unauthorized' })
  })

  it('returns recurring shifts for authenticated managers', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    })

    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', name: 'Test User', role: 'manager' },
    })

    const mockPrismaClient = {
      shift: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: '1',
            userId: 'employee1',
            startTime: '09:00',
            endTime: '17:00',
            recurringDays: [1, 3, 5],
            recurringFrequency: 'weekly',
            recurringEndDate: new Date('2023-12-31'),
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
        userId: 'employee1',
        startTime: '09:00',
        endTime: '17:00',
        recurringDays: [1, 3, 5],
        recurringFrequency: 'weekly',
        recurringEndDate: '2023-12-31T00:00:00.000Z',
      },
    ])
  })

  it('creates a new recurring shift', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        userId: 'employee1',
        startTime: '09:00',
        endTime: '17:00',
        recurringDays: [1, 3, 5],
        recurringFrequency: 'weekly',
        recurringEndDate: '2023-12-31',
      },
    })

    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', name: 'Test User', role: 'manager' },
    })

    const mockPrismaClient = {
      shift: {
        create: jest.fn().mockResolvedValue({
          id: '1',
          userId: 'employee1',
          startTime: '09:00',
          endTime: '17:00',
          recurringDays: [1, 3, 5],
          recurringFrequency: 'weekly',
          recurringEndDate: new Date('2023-12-31'),
        }),
      },
    }

    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrismaClient)

    await POST(req)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      id: '1',
      userId: 'employee1',
      startTime: '09:00',
      endTime: '17:00',
      recurringDays: [1, 3, 5],
      recurringFrequency: 'weekly',
      recurringEndDate: '2023-12-31T00:00:00.000Z',
    })
  })
})

