'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '../contexts/NotificationContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'

type GeneratedShift = {
  userId: string
  date: string
  startTime: string
  endTime: string
}

export default function AIScheduleGenerator() {
  const [parHours, setParHours] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedShift[] | null>(null)
  const { data: session } = useSession()
  const { addNotification } = useNotifications()

  const handleGenerateSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parHours: parseInt(parHours),
          startDate,
          endDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate schedule')
      }

      const data = await response.json()
      setGeneratedSchedule(data)
      addNotification('Schedule generated successfully', 'success')
    } catch (error) {
      console.error('Error generating schedule:', error)
      addNotification('Failed to generate schedule', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeploySchedule = async () => {
    if (!generatedSchedule) return

    setIsDeploying(true)
    try {
      const response = await fetch('/api/deploy-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule: generatedSchedule }),
      })

      if (!response.ok) {
        throw new Error('Failed to deploy schedule')
      }

      addNotification('Schedule deployed successfully', 'success')
      setGeneratedSchedule(null)
    } catch (error) {
      console.error('Error deploying schedule:', error)
      addNotification('Failed to deploy schedule', 'error')
    } finally {
      setIsDeploying(false)
    }
  }

  if (!session?.user || session.user.role !== 'manager') {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Schedule Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerateSchedule} className="space-y-4">
          <div>
            <Label htmlFor="parHours">Par Hours</Label>
            <Input
              id="parHours"
              type="number"
              value={parHours}
              onChange={(e) => setParHours(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Schedule'
            )}
          </Button>
        </form>
        {generatedSchedule && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Generated Schedule</h3>
            <div className="max-h-60 overflow-y-auto mb-4">
              {generatedSchedule.map((shift, index) => (
                <div key={index} className="mb-2">
                  <p>Date: {shift.date}</p>
                  <p>Employee ID: {shift.userId}</p>
                  <p>Time: {shift.startTime} - {shift.endTime}</p>
                </div>
              ))}
            </div>
            <Button onClick={handleDeploySchedule} disabled={isDeploying}>
              {isDeploying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                'Deploy Schedule'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

