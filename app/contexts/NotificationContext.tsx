'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

interface ShiftUpdate {
  shiftId: string
  newAssignee: string
}

interface TradeRequest {
  requestId: string
  requestorId: string
  shiftId: string
  reason: string
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void
  removeNotification: (id: string) => void
  shiftUpdates: ShiftUpdate[]
  tradeRequests: TradeRequest[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [shiftUpdates, setShiftUpdates] = useState<ShiftUpdate[]>([])
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    const newSocket = io('http://localhost:3000')
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    if (socket && session?.user?.id) {
      socket.emit('join', session.user.id)

      socket.on('notification', (message: string) => {
        addNotification(message, 'info')
      })

      socket.on('shiftUpdated', (update: ShiftUpdate) => {
        setShiftUpdates(prev => [...prev, update])
        addNotification(`Your shift has been updated`, 'info')
      })

      socket.on('newTradeRequest', (request: TradeRequest) => {
        setTradeRequests(prev => [...prev, request])
        addNotification(`New trade request received`, 'info')
      })
    }

    return () => {
      if (socket) {
        socket.off('notification')
        socket.off('shiftUpdated')
        socket.off('newTradeRequest')
      }
    }
  }, [socket, session])

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      type
    }
    setNotifications(prev => [...prev, newNotification])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, shiftUpdates, tradeRequests }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

