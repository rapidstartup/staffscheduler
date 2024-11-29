import Link from 'next/link'
import Calendar from '../../components/Calendar'
import AnalyticsChart from '../../components/AnalyticsChart'

export default function ManagerDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-7">
              <div>
                <a href="#" className="flex items-center py-4 px-2">
                  <span className="font-semibold text-gray-500 text-lg">Staff Scheduler</span>
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/profile" className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-blue-500 hover:text-white transition duration-300">Profile</Link>
              <Link href="/" className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-blue-500 hover:text-white transition duration-300">Log Out</Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-900">Manager Dashboard</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Staff Overview</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-700">15</p>
                <p className="mt-1 text-sm text-gray-500">Total staff members</p>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Shifts</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-700">23</p>
                <p className="mt-1 text-sm text-gray-500">In the next 7 days</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Calendar />
          </div>
          <div className="mt-8">
            <AnalyticsChart />
          </div>
        </div>
      </div>
    </div>
  )
}

