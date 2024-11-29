'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '../contexts/NotificationContext'

type Shift = {
  id: string
  date: string
  startTime: string
  endTime: string
}

export default function ShiftSwapRequest() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedShift, setSelectedShift] = useState<string>('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()
  const { addNotification } = useNotifications()

  const fetchUserShifts = async () => {
    try {
      const response = await fetch('/api/shifts/user')
      if (!response.ok) {
        throw new Error('Failed to fetch shifts')
      }
      const data = await response.json()
      setShifts(data)
    } catch (error) {
      console.error('Error fetching shifts:', error)
      addNotification('Failed to fetch shifts', 'error')
    }
  }

  useState(() => {
    fetchUserShifts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/shift-swap-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shiftId: selectedShift,
          reason,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit shift swap request')
      }

      addNotification('Shift swap request submitted successfully', 'success')
      setSelectedShift('')
      setReason('')
    } catch (error) {
      console.error('Error submitting shift swap request:', error)
      addNotification('Failed to submit shift swap request', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Request Shift Swap</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="shift-select" className="block text-sm font-medium text-gray-700">Select Shift to Swap</label>
          <select
            id="shift-select"
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          >
            <option value="">Select a shift</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {new Date(shift.date).toLocaleDateString()} - {shift.startTime} to {shift.endTime}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Swap</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows={3}
            required
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Shift Swap Request'}
        </button>
      </form>
    </div>
  )
}

