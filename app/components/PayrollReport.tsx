'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { format, startOfWeek, endOfWeek } from 'date-fns'

type PayrollEntry = {
  userId: string
  userName: string
  totalHours: number
  totalPay: number
}

export default function PayrollReport() {
  const [payrollData, setPayrollData] = useState<PayrollEntry[]>([])
  const [startDate, setStartDate] = useState(format(startOfWeek(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(endOfWeek(new Date()), 'yyyy-MM-dd'))
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.role === 'manager') {
      fetchPayrollData()
    }
  }, [session, startDate, endDate])

  const fetchPayrollData = async () => {
    try {
      const response = await fetch(`/api/payroll?start=${startDate}&end=${endDate}`)
      if (!response.ok) {
        throw new Error('Failed to fetch payroll data')
      }
      const data = await response.json()
      setPayrollData(data)
    } catch (error) {
      console.error('Error fetching payroll data:', error)
    }
  }

  if (session?.user?.role !== 'manager') {
    return null
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Payroll Report</h2>
      <div className="mb-4 flex items-center space-x-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button
          onClick={fetchPayrollData}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Generate Report
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pay</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payrollData.map((entry) => (
              <tr key={entry.userId}>
                <td className="px-6 py-4 whitespace-nowrap">{entry.userName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.totalHours.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">${entry.totalPay.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

