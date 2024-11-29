'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '../contexts/NotificationContext'

type UserProfile = {
  id: string
  name: string
  email: string
  phone: string
  position: string
  maxHoursPerWeek: number
  availability: {
    [key: string]: string[]
  }
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const { data: session } = useSession()
  const { addNotification } = useNotifications()

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      addNotification('Failed to fetch profile', 'error')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleAvailabilityChange = (day: string, timeSlot: string, isAvailable: boolean) => {
    setProfile(prev => {
      if (!prev) return null
      const newAvailability = { ...prev.availability }
      if (isAvailable) {
        newAvailability[day] = [...(newAvailability[day] || []), timeSlot]
      } else {
        newAvailability[day] = newAvailability[day].filter(slot => slot !== timeSlot)
      }
      return { ...prev, availability: newAvailability }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      addNotification('Profile updated successfully', 'success')
    } catch (error) {
      console.error('Error updating profile:', error)
      addNotification('Failed to update profile', 'error')
    }
  }

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
          <input
            type="text"
            id="position"
            name="position"
            value={profile.position}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="maxHoursPerWeek" className="block text-sm font-medium text-gray-700">Max Hours Per Week</label>
          <input
            type="number"
            id="maxHoursPerWeek"
            name="maxHoursPerWeek"
            value={profile.maxHoursPerWeek}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Availability</h3>
          {daysOfWeek.map(day => (
            <div key={day} className="mb-2">
              <h4 className="font-medium">{day}</h4>
              <div className="flex flex-wrap gap-2">
                {['Morning', 'Afternoon', 'Evening'].map(timeSlot => (
                  <label key={`${day}-${timeSlot}`} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.availability[day]?.includes(timeSlot) || false}
                      onChange={(e) => handleAvailabilityChange(day, timeSlot, e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2">{timeSlot}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Update Profile
        </button>
      </form>
    </div>
  )
}
