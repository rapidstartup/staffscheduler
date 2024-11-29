'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '../contexts/NotificationContext'
import { format, parseISO } from 'date-fns'

type ShiftTrade = {
  id: string
  requestorId: string
  targetUserId: string
  shiftId: string
  reason: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  requestor: { name: string }
  targetUser: { name: string }
  shift: {
    date: string
    startTime: string
    endTime: string
  }
}

export default function ShiftTrading() {
  const [trades, setTrades] = useState<ShiftTrade[]>([])
  const { data: session } = useSession()
  const { addNotification } = useNotifications()

  useEffect(() => {
    fetchTrades()
  }, [])

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/shift-trades')
      if (!response.ok) {
        throw new Error('Failed to fetch shift trades')
      }
      const data = await response.json()
      setTrades(data)
    } catch (error) {
      console.error('Error fetching shift trades:', error)
      addNotification('Failed to fetch shift trades', 'error')
    }
  }

  const handleTradeResponse = async (tradeId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/shift-trades/${tradeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update shift trade')
      }

      addNotification(`Shift trade ${status.toLowerCase()}`, 'success')
      fetchTrades()
    } catch (error) {
      console.error('Error updating shift trade:', error)
      addNotification('Failed to update shift trade', 'error')
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Shift Trading</h2>
      {trades.length === 0 ? (
        <p>No shift trades available.</p>
      ) : (
        <ul className="space-y-4">
          {trades.map((trade) => (
            <li key={trade.id} className="border p-4 rounded-lg">
              <p className="font-semibold">
                {trade.requestor.name} wants to trade shift with {trade.targetUser.name}
              </p>
              <p>
                Date: {format(parseISO(trade.shift.date), 'MMMM d, yyyy')}
              </p>
              <p>
                Time: {trade.shift.startTime} - {trade.shift.endTime}
              </p>
              <p>Reason: {trade.reason}</p>
              <p>Status: {trade.status}</p>
              {trade.status === 'PENDING' && trade.targetUserId === session?.user?.id && (
                <div className="mt-2">
                  <button
                    onClick={() => handleTradeResponse(trade.id, 'ACCEPTED')}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleTradeResponse(trade.id, 'REJECTED')}
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

