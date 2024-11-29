'use client'

import { useState, useEffect } from 'react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
)

type AnalyticsData = {
  weeklyHours: { [key: string]: number }
  departmentDistribution: { [key: string]: number }
  monthlyTrends: { [key: string]: number }
}

export default function AdvancedAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedChart, setSelectedChart] = useState<'weeklyHours' | 'departmentDistribution' | 'monthlyTrends'>('weeklyHours')

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    }
  }

  const weeklyHoursChart = {
    labels: analyticsData ? Object.keys(analyticsData.weeklyHours) : [],
    datasets: [
      {
        label: 'Hours Worked',
        data: analyticsData ? Object.values(analyticsData.weeklyHours) : [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  }

  const departmentDistributionChart = {
    labels: analyticsData ? Object.keys(analyticsData.departmentDistribution) : [],
    datasets: [
      {
        data: analyticsData ? Object.values(analyticsData.departmentDistribution) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  }

  const monthlyTrendsChart = {
    labels: analyticsData ? Object.keys(analyticsData.monthlyTrends) : [],
    datasets: [
      {
        label: 'Total Hours',
        data: analyticsData ? Object.values(analyticsData.monthlyTrends) : [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Advanced Analytics',
      },
    },
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Advanced Analytics</h2>
      <div className="mb-4">
        <select
          value={selectedChart}
          onChange={(e) => setSelectedChart(e.target.value as any)}
          className="border rounded px-2 py-1"
        >
          <option value="weeklyHours">Weekly Hours</option>
          <option value="departmentDistribution">Department Distribution</option>
          <option value="monthlyTrends">Monthly Trends</option>
        </select>
      </div>
      <div className="h-96">
        {selectedChart === 'weeklyHours' && <Bar options={options} data={weeklyHoursChart} />}
        {selectedChart === 'departmentDistribution' && <Pie data={departmentDistributionChart} />}
        {selectedChart === 'monthlyTrends' && <Line options={options} data={monthlyTrendsChart} />}
      </div>
    </div>
  )
}

