'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '../contexts/NotificationContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type ReportData = {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
  }[]
}

export default function ReportingDashboard() {
  const [reportType, setReportType] = useState<string>('employeeHours')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const { data: session } = useSession()
  const { addNotification } = useNotifications()

  const generateReport = async () => {
    if (!dateRange) {
      addNotification('Please select a date range', 'error')
      return
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await response.json()
      setReportData(data)
      addNotification('Report generated successfully', 'success')
    } catch (error) {
      console.error('Error generating report:', error)
      addNotification('Failed to generate report', 'error')
    }
  }

  if (!session?.user || (session.user.role !== 'manager' && session.user.role !== 'admin')) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporting Dashboard</CardTitle>
        <CardDescription>Generate and view reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">Report Type</label>
            <Select onValueChange={(value) => setReportType(value)}>
              <SelectTrigger id="report-type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employeeHours">Employee Hours</SelectItem>
                <SelectItem value="shiftCoverage">Shift Coverage</SelectItem>
                <SelectItem value="overtimeAnalysis">Overtime Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="date-range" className="block text-sm font-medium text-gray-700">Date Range</label>
            <DatePickerWithRange id="date-range" onDateRangeChange={setDateRange} />
          </div>
          <Button onClick={generateReport}>Generate Report</Button>
        </div>
        {reportData && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Report Results</h3>
            {reportType === 'employeeHours' && (
              <Bar
                data={reportData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Employee Hours',
                    },
                  },
                }}
              />
            )}
            {reportType === 'shiftCoverage' && (
              <Line
                data={reportData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Shift Coverage',
                    },
                  },
                }}
              />
            )}
            {reportType === 'overtimeAnalysis' && (
              <Bar
                data={reportData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Overtime Analysis',
                    },
                  },
                }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

