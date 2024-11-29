'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function PushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg)
        reg.pushManager.getSubscription().then(sub => {
          if (sub) {
            setIsSubscribed(true)
            setSubscription(sub)
          }
        })
      })
    }
  }, [])

  const subscribeUser = async () => {
    try {
      const sub = await registration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      })
      setSubscription(sub)
      setIsSubscribed(true)
      await saveSubscription(sub)
    } catch (error) {
      console.error('Failed to subscribe the user: ', error)
    }
  }

  const unsubscribeUser = async () => {
    try {
      await subscription!.unsubscribe()
      setSubscription(null)
      setIsSubscribed(false)
      await deleteSubscription()
    } catch (error) {
      console.error('Error unsubscribing', error)
    }
  }

  const saveSubscription = async (sub: PushSubscription) => {
    const response = await fetch('/api/push-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sub),
    })
    if (!response.ok) {
      throw new Error('Bad status code from server.')
    }
  }

  const deleteSubscription = async () => {
    await fetch('/api/push-subscription', {
      method: 'DELETE',
    })
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Push Notifications</h2>
      {isSubscribed ? (
        <div>
          <p className="mb-4">You are currently subscribed to push notifications.</p>
          <button
            onClick={unsubscribeUser}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Unsubscribe from Push Notifications
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-4">Subscribe to receive notifications about your upcoming shifts.</p>
          <button
            onClick={subscribeUser}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Subscribe to Push Notifications
          </button>
        </div>
      )}
    </div>
  )
}

