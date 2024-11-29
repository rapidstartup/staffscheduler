'use client'

import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Staff Hours by Department',
    },
  },
}

const labels = ['HR', 'Sales', 'Marketing', 'Engineering', 'Customer Support']

const data = {
  labels,
  datasets: [
    {
      label: 'Hours Worked',
      data: labels.map(() => Math.floor(Math.random() * 100)),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
}

export default function AnalyticsChart() {
  return <Bar options={options} data={data} />
}

