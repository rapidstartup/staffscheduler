'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'

type Message = {
  text: string
  sender: 'user' | 'bot'
}

type ScheduleInfo = {
  upcomingShifts: number
  totalHours: number
  pendingRequests: number
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello! How can I assist you with scheduling today?', sender: 'bot' },
  ])
  const [input, setInput] = useState('')
  const [scheduleInfo, setScheduleInfo] = useState<ScheduleInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session?.user) {
      fetchScheduleInfo()
    }
  }, [session])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchScheduleInfo = async () => {
    try {
      const response = await fetch('/api/schedule-info')
      const data = await response.json()
      setScheduleInfo(data)
    } catch (error) {
      console.error('Error fetching schedule info:', error)
    }
  }

  const handleSend = async () => {
    if (input.trim() === '') return

    setMessages(prev => [...prev, { text: input, sender: 'user' }])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, scheduleInfo }),
      })

      if (!response.ok) {
        throw new Error('Failed to get chatbot response')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { text: 'Sorry, I encountered an error. Please try again later.', sender: 'bot' }])
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle>Chat Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {message.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-4 border-t">
        <div className="flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-grow mr-2"
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

