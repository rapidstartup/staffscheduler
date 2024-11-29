'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns'
import { useNotifications } from '../contexts/NotificationContext'
import CloneWeeklySchedule from './CloneWeeklySchedule'

type Shift = {
  id: string
  userId: string
  date: string
  startTime: string
  endTime: string
  isRecurring: boolean
  recurringDays: number[]
}

export default function Schedule() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()))
  const { data: session } = useSession()
  const { addNotification } = useNotifications()

  const fetchShifts = useCallback(async () => {
    try {
      const response = await fetch(`/api/shifts?start=${format(currentWeekStart, 'yyyy-MM-dd')}&end=${format(endOfWeek(currentWeekStart), 'yyyy-MM-dd')}`)
      if (!response.ok) {
        throw new Error('Failed to fetch shifts')
      }
      const data = await response.json()
      setShifts(data)
    } catch (error) {
      console.error('Error fetching shifts:', error)
      addNotification('Failed to fetch shifts', 'error')
    }
  }, [currentWeekStart, addNotification])

  useEffect(() => {
    fetchShifts()
  }, [fetchShifts])

  const nextWeek = useCallback(() => {
    setCurrentWeekStart(prev => addWeeks(prev, 1))
  }, [])

  const prevWeek = useCallback(() => {
    setCurrentWeekStart(prev => subWeeks(prev, 1))
  }, [])

  const weekDays = useMemo(() => eachDayOfInterval({ start: currentWeekStart, end: endOfWeek(currentWeekStart) }), [currentWeekStart])

  const shiftsByDay = useMemo(() => {
    return weekDays.map(day => ({
      date: day,
      shifts: shifts.filter(shift => 
        isSameDay(parseISO(shift.date), day) || (shift.isRecurring && shift.recurringDays.includes(day.getDay()))
      )
    }))
  }, [weekDays, shifts])

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Weekly Schedule</h2>
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevWeek} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Previous Week</button>
        <span className="text-lg font-semibold">{format(currentWeekStart, 'MMMM d, yyyy')} - {format(endOfWeek(currentWeekStart), 'MMMM d, yyyy')}</span>
        <button onClick={nextWeek} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Next Week</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Shifts</th>
            </tr>
          </thead>
          <tbody>
            {shiftsByDay.map(({ date, shifts }) => (
              <tr key={date.toISOString()}>
                <td className="border px-4 py-2">{format(date, 'EEEE, MMMM d')}</td>
                <td className="border px-4 py-2">
                  {shifts.map(shift => (
                    <div key={shift.id} className="mb-2">
                      <span className="font-semibold">{shift.startTime} - {shift.endTime}</span>
                      {shift.isRecurring && <span className="ml-2 text-sm text-gray-500">(Recurring)</span>}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {session?.user?.role === 'manager' && (
        <div className="mt-8">
          <CloneWeeklySchedule />
        </div>
      )}
    </div>
  )
}

