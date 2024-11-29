import { createMocks } from 'node-mocks-http'
import { GET, POST } from '../../app/api/shifts/route'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

jest.mock('next-auth/next')
jest.mock('@prisma/client')

describe('/api/shifts', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('GET /api/shifts returns shifts for authenticated users', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        month: '6',
        year: '2023',
      },
    })

    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', name: 'Test User' },
    })

    const mockPrismaClient = {
      shift: {
        findMany: jest.fn().mockResolvedValue([
          { id: '1', date: new Date('2023-06-01'), startTime: '09:00', endTime: '17:00' },
        ]),
      },
    }

    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrismaClient)

    await GET(req)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual([
      { id: '1', date: '2023-06-01T00:00:00.000Z', startTime: '09:00', endTime: '17:00' },
    ])
  })

  it('POST /api/shifts creates a new shift for authenticated users', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        date: '2023-06-01',
        startTime: '09:00',
        endTime: '17:00',
        userId: '1',
      },
    })

    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', name: 'Test User' },
    })

    const mockPrismaClient = {
      shift: {
        create: jest.fn().mockResolvedValue({
          id: '1',
          date: new Date('2023-06-01'),
          startTime: '09:00',
          endTime: '17:00',
          userId: '1',
        }),
      },
    }

    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrismaClient)

    await POST(req)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      id: '1',
      date: '2023-06-01T00:00:00.000Z',
      startTime: '09:00',
      endTime: '17:00',
      userId: '1',
    })
  })
})

