import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import AccessibilityMenu from '../components/AccessibilityMenu'
import { useNotifications } from '../contexts/NotificationContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"

const Calendar = dynamic(() => import('../components/Calendar'), { ssr: false })
const TimeTracking = dynamic(() => import('../components/TimeTracking'), { ssr: false })
const Schedule = dynamic(() => import('../components/Schedule'), { ssr: false })
const ShiftSwapRequest = dynamic(() => import('../components/ShiftSwapRequest'), { ssr: false })
const ShiftSwapManagement = dynamic(() => import('../components/ShiftSwapManagement'), { ssr: false })
const LeaveManagement = dynamic(() => import('../components/LeaveManagement'), { ssr: false })
const LeavePolicyManager = dynamic(() => import('../components/LeavePolicyManager'), { ssr: false })
const CalendarIntegration = dynamic(() => import('../components/CalendarIntegration'), { ssr: false })
const PushNotifications = dynamic(() => import('../components/PushNotifications'), { ssr: false })
const PositionsAndWages = dynamic(() => import('../components/PositionsAndWages'), { ssr: false })
const PayrollReport = dynamic(() => import('../components/PayrollReport'), { ssr: false })
const AdvancedAnalytics = dynamic(() => import('../components/AdvancedAnalytics'), { ssr: false })
const ReportingDashboard = dynamic(() => import('../components/ReportingDashboard'), { ssr: false })
const UserRoleManagement = dynamic(() => import('../components/UserRoleManagement'), { ssr: false })
const Chatbot = dynamic(() => import('../components/Chatbot'), { ssr: false })
const ShiftDistribution = dynamic(() => import('../components/ShiftDistribution'), { ssr: false })
const NotificationCenter = dynamic(() => import('../components/NotificationCenter'), { ssr: false })
const AIScheduleGenerator = dynamic(() => import('../components/AIScheduleGenerator'), { ssr: false })
const BrandingKit = dynamic(() => import('../components/BrandingKit'), { ssr: false })
const RecurringShiftManager = dynamic(() => import('../components/RecurringShiftManager'), { ssr: false })

export default function Dashboard() {
  const { data: session } = useSession()
  const { notifications, removeNotification } = useNotifications()

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout>
      <AccessibilityMenu />
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-700 dark:text-gray-300">5</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Hours This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-700 dark:text-gray-300">32</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-700 dark:text-gray-300">2</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Suspense fallback={<div>Loading calendar...</div>}>
            <Calendar />
          </Suspense>
          <Suspense fallback={<div>Loading shift distribution...</div>}>
            <ShiftDistribution />
          </Suspense>
          <Suspense fallback={<div>Loading time tracking...</div>}>
            <TimeTracking />
          </Suspense>
          <Suspense fallback={<div>Loading schedule...</div>}>
            <Schedule />
          </Suspense>
          <Suspense fallback={<div>Loading shift swap request...</div>}>
            <ShiftSwapRequest />
          </Suspense>
          <Suspense fallback={<div>Loading shift swap management...</div>}>
            <ShiftSwapManagement />
          </Suspense>
          <Suspense fallback={<div>Loading leave management...</div>}>
            <LeaveManagement />
          </Suspense>
          {(session.user.role === 'manager' || session.user.role === 'admin') && (
            <Suspense fallback={<div>Loading leave policy manager...</div>}>
              <LeavePolicyManager />
            </Suspense>
          )}
          <Suspense fallback={<div>Loading calendar integration...</div>}>
            <CalendarIntegration />
          </Suspense>
          <Suspense fallback={<div>Loading push notifications...</div>}>
            <PushNotifications />
          </Suspense>
          <Suspense fallback={<div>Loading positions and wages...</div>}>
            <PositionsAndWages />
          </Suspense>
          {(session.user.role === 'manager' || session.user.role === 'admin') && (
            <>
              <Suspense fallback={<div>Loading payroll report...</div>}>
                <PayrollReport />
              </Suspense>
              <Suspense fallback={<div>Loading advanced analytics...</div>}>
                <AdvancedAnalytics />
              </Suspense>
              <Suspense fallback={<div>Loading reporting dashboard...</div>}>
                <ReportingDashboard />
              </Suspense>
              <Suspense fallback={<div>Loading AI schedule generator...</div>}>
                <AIScheduleGenerator />
              </Suspense>
              <Suspense fallback={<div>Loading recurring shift manager...</div>}>
                <RecurringShiftManager />
              </Suspense>
            </>
          )}
          {session.user.role === 'admin' && (
            <>
              <Suspense fallback={<div>Loading user role management...</div>}>
                <UserRoleManagement />
              </Suspense>
              <Suspense fallback={<div>Loading branding kit...</div>}>
                <BrandingKit />
              </Suspense>
            </>
          )}
          <Suspense fallback={<div>Loading chatbot...</div>}>
            <Chatbot />
          </Suspense>
        </div>
      </div>
      <NotificationCenter />
    </DashboardLayout>
  )
}

