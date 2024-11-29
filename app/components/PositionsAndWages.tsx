'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

type Position = {
  id: string
  title: string
  wageType: 'HOURLY' | 'SALARY' | 'PER_CLASS'
  wageRate: number
}

export default function PositionsAndWages() {
  const { data: session } = useSession()
  const [positions, setPositions] = useState<Position[]>([])
  const [newPosition, setNewPosition] = useState<Omit<Position, 'id'>>({
    title: '',
    wageType: 'HOURLY',
    wageRate: 0
  })

  useEffect(() => {
    fetchPositions()
  }, [])

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions')
      const data = await response.json()
      setPositions(data)
    } catch (error) {
      console.error('Error fetching positions:', error)
    }
  }

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPosition)
      })
      const addedPosition = await response.json()
      setPositions([...positions, addedPosition])
      setNewPosition({ title: '', wageType: 'HOURLY', wageRate: 0 })
    } catch (error) {
      console.error('Error adding position:', error)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow" aria-labelledby="positions-wages-title">
      <h2 id="positions-wages-title" className="text-xl font-bold mb-4">Positions and Wages</h2>
      <ul className="mb-4" aria-label="List of positions and wages">
        {positions.map(position => (
          <li key={position.id} className="mb-2">
            {position.title} - {position.wageType} - ${position.wageRate.toFixed(2)}
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddPosition} aria-label="Add new position form">
        <div className="mb-2">
          <label htmlFor="position-title" className="block text-sm font-medium text-gray-700">
            Position Title
          </label>
          <input
            id="position-title"
            type="text"
            value={newPosition.title}
            onChange={e => setNewPosition({...newPosition, title: e.target.value})}
            placeholder="Position Title"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <div className="mb-2">
          <label htmlFor="wage-type" className="block text-sm font-medium text-gray-700">
            Wage Type
          </label>
          <select
            id="wage-type"
            value={newPosition.wageType}
            onChange={e => setNewPosition({...newPosition, wageType: e.target.value as 'HOURLY' | 'SALARY' | 'PER_CLASS'})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="HOURLY">Hourly</option>
            <option value="SALARY">Salary</option>
            <option value="PER_CLASS">Per Class</option>
          </select>
        </div>
        <div className="mb-2">
          <label htmlFor="wage-rate" className="block text-sm font-medium text-gray-700">
            Wage Rate
          </label>
          <input
            id="wage-rate"
            type="number"
            value={newPosition.wageRate}
            onChange={e => setNewPosition({...newPosition, wageRate: parseFloat(e.target.value)})}
            placeholder="Wage Rate"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
            min="0"
            step="0.01"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          Add Position
        </button>
      </form>
    </div>
  )
}

