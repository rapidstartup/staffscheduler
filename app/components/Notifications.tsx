'use client'

import { useNotifications } from '../contexts/NotificationContext'

export default function Notifications() {
  const { notifications } = useNotifications()

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {notifications.map((notification, index) => (
        <div
          key={index}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2"
        >
          {notification}
        </div>
      ))}
    </div>
  )
}

