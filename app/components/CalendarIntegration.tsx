'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '../contexts/NotificationContext'

export default function CalendarIntegration() {
  const [googleConnected, setGoogleConnected] = useState(false)
  const { data: session } = useSession()
  const { addNotification } = useNotifications()

  useEffect(() => {
    checkGoogleConnection()
  }, [])

  const checkGoogleConnection = async () => {
    try {
      const response = await fetch('/api/calendar/google')
      const data = await response.json()
      setGoogleConnected(!data.authUrl)
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error)
    }
  }

  const handleGoogleConnect = async () => {
    try {
      const response = await fetch('/api/calendar/google')
      const data = await response.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        addNotification('Shifts synced to Google Calendar', 'success')
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error)
      addNotification('Failed to connect to Google Calendar', 'error')
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Calendar Integration</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Google Calendar</span>
          {googleConnected ? (
            <button
              onClick={handleGoogleConnect}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Sync Shifts
            </button>
          ) : (
            <button
              onClick={handleGoogleConnect}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Connect
            </button>
          )}
        </div>
        {/* Add more calendar services here */}
      </div>
    </div>
  )
}

