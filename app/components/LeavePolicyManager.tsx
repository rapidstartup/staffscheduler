'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '../contexts/NotificationContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type LeavePolicy = {
  id: string
  leaveType: 'VACATION' | 'SICK' | 'PERSONAL'
  daysPerYear: number
  accrualRate: 'MONTHLY' | 'YEARLY'
  carryOver: number
}

export default function LeavePolicyManager() {
  const [policies, setPolicies] = useState<LeavePolicy[]>([])
  const [newPolicy, setNewPolicy] = useState<Omit<LeavePolicy, 'id'>>({
    leaveType: 'VACATION',
    daysPerYear: 0,
    accrualRate: 'MONTHLY',
    carryOver: 0,
  })
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null)
  const { data: session } = useSession()
  const { addNotification } = useNotifications()

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/leave-policies')
      if (!response.ok) {
        throw new Error('Failed to fetch leave policies')
      }
      const data = await response.json()
      setPolicies(data)
    } catch (error) {
      console.error('Error fetching leave policies:', error)
      addNotification('Failed to fetch leave policies', 'error')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/leave-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy)
      })
      if (!response.ok) {
        throw new Error('Failed to create leave policy')
      }
      await fetchPolicies()
      setNewPolicy({
        leaveType: 'VACATION',
        daysPerYear: 0,
        accrualRate: 'MONTHLY',
        carryOver: 0,
      })
      addNotification('Leave policy created successfully', 'success')
    } catch (error) {
      console.error('Error creating leave policy:', error)
      addNotification('Failed to create leave policy', 'error')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPolicy) return

    try {
      const response = await fetch(`/api/leave-policies/${editingPolicy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPolicy)
      })
      if (!response.ok) {
        throw new Error('Failed to update leave policy')
      }
      await fetchPolicies()
      setEditingPolicy(null)
      addNotification('Leave policy updated successfully', 'success')
    } catch (error) {
      console.error('Error updating leave policy:', error)
      addNotification('Failed to update leave policy', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/leave-policies/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete leave policy')
      }
      await fetchPolicies()
      addNotification('Leave policy deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting leave policy:', error)
      addNotification('Failed to delete leave policy', 'error')
    }
  }

  if (session?.user.role !== 'manager' && session?.user.role !== 'admin') {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Policy Manager</CardTitle>
        <CardDescription>Create and manage leave policies</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">Leave Type</label>
              <Select
                onValueChange={(value) => setNewPolicy({ ...newPolicy, leaveType: value as 'VACATION' | 'SICK' | 'PERSONAL' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VACATION">Vacation</SelectItem>
                  <SelectItem value="SICK">Sick Leave</SelectItem>
                  <SelectItem value="PERSONAL">Personal Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="daysPerYear" className="block text-sm font-medium text-gray-700">Days Per Year</label>
              <Input
                type="number"
                id="daysPerYear"
                value={newPolicy.daysPerYear}
                onChange={(e) => setNewPolicy({ ...newPolicy, daysPerYear: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <label htmlFor="accrualRate" className="block text-sm font-medium text-gray-700">Accrual Rate</label>
              <Select
                onValueChange={(value) => setNewPolicy({ ...newPolicy, accrualRate: value as 'MONTHLY' | 'YEARLY' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select accrual rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="carryOver" className="block text-sm font-medium text-gray-700">Carry Over Days</label>
              <Input
                type="number"
                id="carryOver"
                value={newPolicy.carryOver}
                onChange={(e) => setNewPolicy({ ...newPolicy, carryOver: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>
          <Button type="submit">Create Policy</Button>
        </form>

        <div>
          <h3 className="text-lg font-semibold mb-2">Existing Policies</h3>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="border p-4 rounded-lg">
                {editingPolicy && editingPolicy.id === policy.id ? (
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="editLeaveType" className="block text-sm font-medium text-gray-700">Leave Type</label>
                        <Select
                          onValueChange={(value) => setEditingPolicy({ ...editingPolicy, leaveType: value as 'VACATION' | 'SICK' | 'PERSONAL' })}
                          defaultValue={editingPolicy.leaveType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VACATION">Vacation</SelectItem>
                            <SelectItem value="SICK">Sick Leave</SelectItem>
                            <SelectItem value="PERSONAL">Personal Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="editDaysPerYear" className="block text-sm font-medium text-gray-700">Days Per Year</label>
                        <Input
                          type="number"
                          id="editDaysPerYear"
                          value={editingPolicy.daysPerYear}
                          onChange={(e) => setEditingPolicy({ ...editingPolicy, daysPerYear: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="editAccrualRate" className="block text-sm font-medium text-gray-700">Accrual Rate</label>
                        <Select
                          onValueChange={(value) => setEditingPolicy({ ...editingPolicy, accrualRate: value as 'MONTHLY' | 'YEARLY' })}
                          defaultValue={editingPolicy.accrualRate}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select accrual rate" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                            <SelectItem value="YEARLY">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="editCarryOver" className="block text-sm font-medium text-gray-700">Carry Over Days</label>
                        <Input
                          type="number"
                          id="editCarryOver"
                          value={editingPolicy.carryOver}
                          onChange={(e) => setEditingPolicy({ ...editingPolicy, carryOver: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit">Save Changes</Button>
                      <Button type="button" variant="outline" onClick={() => setEditingPolicy(null)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p><strong>Leave Type:</strong> {policy.leaveType}</p>
                    <p><strong>Days Per Year:</strong> {policy.daysPerYear}</p>
                    <p><strong>Accrual Rate:</strong> {policy.accrualRate}</p>
                    <p><strong>Carry Over Days:</strong> {policy.carryOver}</p>
                    <div className="mt-2 flex space-x-2">
                      <Button onClick={() => setEditingPolicy(policy)} variant="outline">Edit</Button>
                      <Button onClick={() => handleDelete(policy.id)} variant="destructive">Delete</Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

