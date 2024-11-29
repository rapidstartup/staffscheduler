import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { NotificationProvider } from '@/app/contexts/NotificationContext'
import LeavePolicyManager from '@/components/LeavePolicyManager'

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: '1', name: 'Test User', role: 'manager' } },
    status: 'authenticated',
  })),
}))

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock

describe('LeavePolicyManager', () => {
  it('renders the leave policy manager for managers', () => {
    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <LeavePolicyManager />
        </NotificationProvider>
      </SessionProvider>
    )

    expect(screen.getByText('Leave Policy Manager')).toBeInTheDocument()
    expect(screen.getByText('Create and manage leave policies')).toBeInTheDocument()
    expect(screen.getByText('Create Policy')).toBeInTheDocument()
  })

  it('allows creating a new leave policy', async () => {
    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <LeavePolicyManager />
        </NotificationProvider>
      </SessionProvider>
    )

    fireEvent.change(screen.getByLabelText('Leave Type'), { target: { value: 'VACATION' } })
    fireEvent.change(screen.getByLabelText('Days Per Year'), { target: { value: '20' } })
    fireEvent.change(screen.getByLabelText('Accrual Rate'), { target: { value: 'MONTHLY' } })
    fireEvent.change(screen.getByLabelText('Carry Over Days'), { target: { value: '5' } })

    fireEvent.click(screen.getByText('Create Policy'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/leave-policies', expect.any(Object))
    })
  })

  it('displays existing leave policies', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '1',
            leaveType: 'VACATION',
            daysPerYear: 20,
            accrualRate: 'MONTHLY',
            carryOver: 5,
          },
        ]),
      })
    ) as jest.Mock

    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <LeavePolicyManager />
        </NotificationProvider>
      </SessionProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Existing Policies')).toBeInTheDocument()
      expect(screen.getByText('Leave Type: VACATION')).toBeInTheDocument()
      expect(screen.getByText('Days Per Year: 20')).toBeInTheDocument()
      expect(screen.getByText('Accrual Rate: MONTHLY')).toBeInTheDocument()
      expect(screen.getByText('Carry Over Days: 5')).toBeInTheDocument()
    })
  })

  it('allows editing an existing leave policy', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '1',
            leaveType: 'VACATION',
            daysPerYear: 20,
            accrualRate: 'MONTHLY',
            carryOver: 5,
          },
        ]),
      })
    ) as jest.Mock

    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <LeavePolicyManager />
        </NotificationProvider>
      </SessionProvider>
    )

    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit'))
    })

    fireEvent.change(screen.getByLabelText('Days Per Year'), { target: { value: '25' } })
    fireEvent.click(screen.getByText('Save Changes'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/leave-policies/1', expect.any(Object))
    })
  })

  it('allows deleting a leave policy', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '1',
            leaveType: 'VACATION',
            daysPerYear: 20,
            accrualRate: 'MONTHLY',
            carryOver: 5,
          },
        ]),
      })
    ) as jest.Mock

    render(
      <SessionProvider session={null}>
        <NotificationProvider>
          <LeavePolicyManager />
        </NotificationProvider>
      </SessionProvider>
    )

    await waitFor(() => {
      fireEvent.click(screen.getByText('Delete'))
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/leave-policies/1', expect.any(Object))
    })
  })
})

