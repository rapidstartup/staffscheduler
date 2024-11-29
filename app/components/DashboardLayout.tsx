import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Navigation from './Navigation'

const Calendar = dynamic(() => import('./Calendar'), { ssr: false })
const ShiftTrading = dynamic(() => import('./ShiftTrading'), { ssr: false })
const TimeTracking = dynamic(() => import('./TimeTracking'), { ssr: false })
const LeaveManagement = dynamic(() => import('./LeaveManagement'), { ssr: false })
const AdvancedAnalytics = dynamic(() => import('./AdvancedAnalytics'), { ssr: false })

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Suspense fallback={<div>Loading calendar...</div>}>
              <Calendar />
            </Suspense>
            <Suspense fallback={<div>Loading shift trading...</div>}>
              <ShiftTrading />
            </Suspense>
            <Suspense fallback={<div>Loading time tracking...</div>}>
              <TimeTracking />
            </Suspense>
            <Suspense fallback={<div>Loading leave management...</div>}>
              <LeaveManagement />
            </Suspense>
            <Suspense fallback={<div>Loading analytics...</div>}>
              <AdvancedAnalytics />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

