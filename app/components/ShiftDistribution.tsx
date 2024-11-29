'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

type ShiftDistributionData = {
  [key: string]: number
}

export default function ShiftDistribution() {
  const [distributionData, setDistributionData] = useState<ShiftDistributionData>({})

  useEffect(() => {
    fetchShiftDistribution()
  }, [])

  const fetchShiftDistribution = async () => {
    try {
      const response = await fetch('/api/shift-distribution')
      if (!response.ok) {
        throw new Error('Failed to fetch shift distribution data')
      }
      const data = await response.json()
      setDistributionData(data)
    } catch (error) {
      console.error('Error fetching shift distribution:', error)
    }
  }

  const chartData = {
    labels: Object.keys(distributionData),
    datasets: [
      {
        data: Object.values(distributionData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </CardContent>
    </Card>
  )
}

