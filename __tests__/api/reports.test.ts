import { NextApiRequest, NextApiResponse } from 'next'
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/reports/route'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'

jest.mock('next-auth/next')
jest.mock('@prisma/client')

describe('/api/reports', () => {
  it('returns 401 for unauthenticated requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    })

    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    await POST(req)

    expect(res._getStatusCode()).toBe(401)
    expect(JSON.parse(res._getData())).toEqual({ error: 'Unauthorized' })
  })

  it('generates employee hours report', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        reportType: 'employeeHours',
        startDate: '2023-06-01',
        endDate: '2023-06-30',
      },
    })

    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', name: 'Test User', role: 'manager' },
    })

    const mockPrismaClient = {
      timeEntry: {
        groupBy: jest.fn().mockResolvedValue([
          { userId: '1', _sum: { duration: 2400 } },
          { userId: '2', _sum: { duration: 2100 } },
        ]),
      },
      user: {
        findMany: jest.fn().mockResolvedValue([
          { id: '1', name: 'Employee 1' },
          { id: '2', name: 'Employee 2' },
        ]),
      },
    }

    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrismaClient)

    await POST(req)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      labels: ['Employee 1', 'Employee 2'],
      datasets: [
        {
          label: 'Hours Worked',
          data: [40, 35],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    })
  })

  it('generates shift coverage report', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        reportType: 'shiftCoverage',
        startDate: '2023-06-01',
        endDate: '2023-06-07',
      },
    })

    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', name: 'Test User', role: 'manager' },
    })

    const mockPrismaClient = {
      shift: {
        findMany: jest.fn().mockResolvedValue([
          { date: new Date('2023-06-01'), startTime: '09:00', endTime: '17:00' },
          { date: new Date('2023-06-01'), startTime: '17:00', endTime: '01:00' },
          { date: new Date('2023-06-02'), startTime: '09:00', endTime: '17:00' },
        ]),
      },
    }

    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrismaClient)

    await POST(req)

    expect(res._getStatusCode()).toBe(200)
    const response = JSON.parse(res._getData())
    expect(response.labels).toEqual(['2023-06-01', '2023-06-02'])
    expect(response.datasets[0].label).toBe('Shift Coverage (%)')
    expect(response.datasets[0].data).toEqual([66.67, 33.33])
  })

  it('generates overtime analysis report', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        reportType: 'overtimeAnalysis',
        startDate: '2023-06-01',
        endDate: '2023-06-30',
      },
    })

    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { id: '1', name: 'Test User', role: 'manager' },
    })

    const mockPrismaClient = {
      timeEntry
          { userId: '1', _sum: { duration: 2700 } },
          { userId: '2', _sum: { duration: 2400 } },
        ]),
      },
      user: {
        findMany: jest.fn().mockResolvedValue([
          { id: '1', name: 'Employee 1' },
          { id: '2', name: 'Employee 2' },
        ]),
      },
    }

    ;(PrismaClient as jest.Mock).mockImplementation(() => mockPrismaClient)

    await POST(req)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      labels: ['Employee 1', 'Employee 2'],
      datasets: [
        {
          label: 'Overtime Hours',
          data: [5, 0],
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        },
      ],
    })
  })
})

