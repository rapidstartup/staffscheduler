'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { useNotifications } from '../contexts/NotificationContext'
import { isWithinGeofence } from '../utils/geofencing'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TimeEntry = {
  id: string
  userId: string
  startTime: Date
  endTime: Date | null
  locationId: string
}

type Location = {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number // in meters
}

export default function TimeTracking() {
  const [isClockingIn, setIsClockingIn] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [userPosition, setUserPosition] = useState<GeolocationPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const { addNotification } = useNotifications()

  useEffect(() => {
    fetchTimeEntriesAndLocations()
    startLocationTracking()

    return () => {
      stopLocationTracking()
    }
  }, [session])

  const fetchTimeEntriesAndLocations = async () => {
    try {
      const [entriesResponse, locationsResponse] = await Promise.all([
        fetch('/api/time-entries'),
        fetch('/api/locations')
      ])
      const entriesData = await entriesResponse.json()
      const locationsData = await locationsResponse.json()
      setEntries(entriesData)
      setLocations(locationsData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch time entries and locations')
    }
  }

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          setUserPosition(position)
          setError(null)
        },
        (error) => {
          console.error('Error getting user location:', error)
          setError('Unable to get your location. Please enable location services.')
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      )
    } else {
      setError('Geolocation is not supported by your browser')
    }
  }

  const stopLocationTracking = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.clearWatch(0)
    }
  }

  const handleClockIn = async () => {
    if (!selectedLocation) {
      setError('Please select a location')
      return
    }

    const location = locations.find(loc => loc.id === selectedLocation)
    if (!location) {
      setError('Invalid location selected')
      return
    }

    if (!userPosition) {
      setError('Unable to get your current location')
      return
    }

    if (!isWithinGeofence(userPosition, location)) {
      setError(`You are not within the geofence of ${location.name}`)
      return
    }

    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: selectedLocation })
      })
      if (!response.ok) throw new Error('Failed to clock in')
      const newEntry = await response.json()
      setCurrentEntry(newEntry)
      setIsClockingIn(true)
      setError(null)
      addNotification('Successfully clocked in', 'success')
    } catch (error) {
      console.error('Error clocking in:', error)
      setError('Failed to clock in. Please try again.')
    }
  }

  const handleClockOut = async () => {
    if (!currentEntry) return

    try {
      const response = await fetch(`/api/time-entries/${currentEntry.id}`, {
        method: 'PUT'
      })
      if (!response.ok) throw new Error('Failed to clock out')
      const updatedEntry = await response.json()
      setEntries([...entries, updatedEntry])
      setCurrentEntry(null)
      setIsClockingIn(false)
      setError(null)
      addNotification('Successfully clocked out', 'success')
    } catch (error) {
      console.error('Error clocking out:', error)
      setError('Failed to clock out. Please try again.')
    }
  }

  const getTotalHours = () => {
    return entries.reduce((total, entry) => {
      if (entry.endTime) {
        const duration = new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()
        return total + duration / (1000 * 60 * 60) // Convert milliseconds to hours
      }
      return total
    }, 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <Select onValueChange={setSelectedLocation} value={selectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isClockingIn ? (
          <Button onClick={handleClockOut} className="w-full bg-red-500 hover:bg-red-600">
            Clock Out
          </Button>
        ) : (
          <Button onClick={handleClockIn} className="w-full bg-green-500 hover:bg-green-600">
            Clock In
          </Button>
        )}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Recent Time Entries</h3>
          <ul className="space-y-2">
            {entries.slice(0, 5).map(entry => (
              <li key={entry.id} className="bg-gray-100 p-2 rounded">
                <span className="font-medium">{format(new Date(entry.startTime), 'PPpp')}</span> - 
                <span className="font-medium">{entry.endTime ? format(new Date(entry.endTime), 'PPpp') : 'In Progress'}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Total Hours Worked</h3>
          <p className="text-2xl font-bold">{getTotalHours().toFixed(2)} hours</p>
        </div>
      </CardContent>
    </Card>
  )
}

