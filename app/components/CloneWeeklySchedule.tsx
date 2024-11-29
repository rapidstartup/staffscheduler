'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { format, addDays, startOfWeek } from 'date-fns'

export default function CloneWeeklySchedule() {
  const [selectedWeek, setSelectedWeek] = useState(format(startOfWeek(new Date()), 'yyyy-MM-dd'))
  const [isCloning, setIsCloning] = useState(false)
  const [message, setMessage] = useState('')
  const { data: session } = useSession()

  const handleCloneSchedule = async () => {
    if (!session?.user?.role || session.user.role !== 'manager') {
      setMessage('You do not have permission to clone schedules.')
      return
    }

    setIsCloning(true)
    setMessage('')

    try {
      const response = await fetch('/api/clone-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekStart: selectedWeek,
          weekEnd: format(addDays(new Date(selectedWeek), 6), 'yyyy-MM-dd'),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to clone schedule')
      }

      setMessage('Schedule cloned successfully for the following week!')
    } catch (error) {
      console.error('Error cloning schedule:', error)
      setMessage('An error occurred while cloning the schedule. Please try again.')
    } finally {
      setIsCloning(false)
    }
  }

  if (!session?.user?.role || session.user.role !== 'manager') {
    return null
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Clone Weekly Schedule</h2>
      <div className="mb-4">
        <label htmlFor="week-select" className="block text-sm font-medium text-gray-700">Select Week to Clone</label>
        <input
          type="date"
          id="week-select"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <button
        onClick={handleCloneSchedule}
        disabled={isCloning}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
      >
        {isCloning ? 'Cloning...' : 'Clone Schedule'}
      </button>
      {message && (
        <p className={`mt-4 text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

