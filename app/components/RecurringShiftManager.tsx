'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '../contexts/NotificationContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

type RecurringShift = {
  id: string
  userId: string
  startTime: string
  endTime: string
  recurringDays: number[]
  recurringFrequency: string
  recurringEndDate: string
}

export default function RecurringShiftManager() {
  const [shifts, setShifts] = useState<RecurringShift[]>([])
  const [newShift, setNewShift] = useState<Omit<RecurringShift, 'id'>>({
    userId: '',
    startTime: '',
    endTime: '',
    recurringDays: [],
    recurringFrequency: 'weekly',
    recurringEndDate: '',
  })
  const { data: session } = useSession()
  const { addNotification } = useNotifications()

  const fetchRecurringShifts = async () => {
    try {
      const response = await fetch('/api/recurring-shifts')
      if (!response.ok) {
        throw new Error('Failed to fetch recurring shifts')
      }
      const data = await response.json()
      setShifts(data)
    } catch (error) {
      console.error('Error fetching recurring shifts:', error)
      addNotification('Failed to fetch recurring shifts', 'error')
    }
  }

  const handleCreateRecurringShift = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/recurring-shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShift),
      })
      if (!response.ok) {
        throw new Error('Failed to create recurring shift')
      }
      addNotification('Recurring shift created successfully', 'success')
      fetchRecurringShifts()
      setNewShift({
        userId: '',
        startTime: '',
        endTime: '',
        recurringDays: [],
        recurringFrequency: 'weekly',
        recurringEndDate: '',
      })
    } catch (error) {
      console.error('Error creating recurring shift:', error)
      addNotification('Failed to create recurring shift', 'error')
    }
  }

  const handleDeleteRecurringShift = async (shiftId: string) => {
    try {
      const response = await fetch(`/api/recurring-shifts/${shiftId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete recurring shift')
      }
      addNotification('Recurring shift deleted successfully', 'success')
      fetchRecurringShifts()
    } catch (error) {
      console.error('Error deleting recurring shift:', error)
      addNotification('Failed to delete recurring shift', 'error')
    }
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if (!session?.user || session.user.role !== 'manager') {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Shift Manager</CardTitle>
        <CardDescription>Create and manage recurring shifts</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateRecurringShift} className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Employee</label>
            <Select onValueChange={(value) => setNewShift({ ...newShift, userId: value })}>
              <SelectTrigger id="userId">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {/* TODO: Fetch and map employees */}
                <SelectItem value="employee1">Employee 1</SelectItem>
                <SelectItem value="employee2">Employee 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
            <Input
              type="time"
              id="startTime"
              value={newShift.startTime}
              onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
            <Input
              type="time"
              id="endTime"
              value={newShift.endTime}
              onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Recurring Days</label>
            <div className="space-y-2">
              {daysOfWeek.map((day, index) => (
                <div key={day} className="flex items-center">
                  <Checkbox
                    id={`day-${index}`}
                    checked={newShift.recurringDays.includes(index)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNewShift({ ...newShift, recurringDays: [...newShift.recurringDays, index] })
                      } else {
                        setNewShift({ ...newShift, recurringDays: newShift.recurringDays.filter(d => d !== index) })
                      }
                    }}
                  />
                  <label htmlFor={`day-${index}`} className="ml-2 text-sm text-gray-700">{day}</label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="recurringFrequency" className="block text-sm font-medium text-gray-700">Frequency</label>
            <Select onValueChange={(value) => setNewShift({ ...newShift, recurringFrequency: value })}>
              <SelectTrigger id="recurringFrequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="recurringEndDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <Input
              type="date"
              id="recurringEndDate"
              value={newShift.recurringEndDate}
              onChange={(e) => setNewShift({ ...newShift, recurringEndDate: e.target.value })}
              required
            />
          </div>
          <Button type="submit">Create Recurring Shift</Button>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Existing Recurring Shifts</h3>
          {shifts.map((shift) => (
            <div key={shift.id} className="border p-4 rounded-lg mb-4">
              <p>Employee: {shift.userId}</p>
              <p>Time: {shift.startTime} - {shift.endTime}</p>
              <p>Days: {shift.recurringDays.map(d => daysOfWeek[d]).join(', ')}</p>
              <p>Frequency: {shift.recurringFrequency}</p>
              <p>End Date: {shift.recurringEndDate}</p>
              <Button variant="destructive" onClick={() => handleDeleteRecurringShift(shift.id)}>Delete</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

