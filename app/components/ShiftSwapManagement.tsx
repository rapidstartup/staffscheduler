'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '../contexts/NotificationContext'

type ShiftSwapRequest = {
  id: string
  shiftId: string
  requestorId: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  shift: {
    date: string
    startTime: string
    endTime: string
  }
  requestor: {
    id: string
    name: string
  }
}

export default function ShiftSwapManagement() {
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([])
  const { data: session } = useSession()
  const { addNotification } = useNotifications()

  const fetchSwapRequests = async () => {
    try {
      const response = await fetch('/api/shift-swap-requests')
      if (!response.ok) {
        throw new Error('Failed to fetch shift swap requests')
      }
      const data = await response.json()
      setSwapRequests(data)
    } catch (error) {
      console.error('Error fetching shift swap requests:', error)
      addNotification('Failed to fetch shift swap requests', 'error')
    }
  }

  useEffect(() => {
    fetchSwapRequests()
  }, [])

  const handleSwapResponse = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/shift-swap-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update shift swap request')
      }

      addNotification(`Shift swap request ${status.toLowerCase()}`, 'success')
      fetchSwapRequests()
    } catch (error) {
      console.error('Error updating shift swap request:', error)
      addNotification('Failed to update shift swap request', 'error')
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Shift Swap Requests</h2>
      {swapRequests.length === 0 ? (
        <p>No shift swap requests available.</p>
      ) : (
        <ul className="space-y-4">
          {swapRequests.map((request) => (
            <li key={request.id} className="border p-4 rounded-lg">
              <p className="font-semibold">
                {request.requestor.id === session.user.id ? 'Your request' : `${request.requestor.name}'s request`}
              </p>
              <p>
                Date: {new Date(request.shift.date).toLocaleDateString()}
              </p>
              <p>
                Time: {request.shift.startTime} - {request.shift.endTime}
              </p>
              <p>Reason: {request.reason}</p>
              <p>Status: {request.status}</p>
              {request.status === 'PENDING' && request.requestor.id !== session.user.id && (
                <div className="mt-2">
                  <button
                    onClick={() => handleSwapResponse(request.id, 'APPROVED')}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleSwapResponse(request.id, 'REJECTED')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

