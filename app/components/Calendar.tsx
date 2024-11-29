import React, { useState, useCallback, useMemo } from 'react'
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay } from 'date-fns'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// ... other imports

const Calendar: React.FC = React.memo(() => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [shifts, setShifts] = useState([])
  const { data: session } = useSession()

  const onDateClick = useCallback((day: Date) => {
    setSelectedDate(day)
  }, [])

  const nextMonth = useCallback(() => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1))
  }, [])

  const prevMonth = useCallback(() => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1))
  }, [])

  const renderHeader = useMemo(() => {
    const dateFormat = "MMMM yyyy"
    return (
      <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800">
        <Button onClick={prevMonth} variant="outline" className="text-sm md:text-base">&lt;</Button>
        <span className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">
          {format(currentMonth, dateFormat)}
        </span>
        <Button onClick={nextMonth} variant="outline" className="text-sm md:text-base">&gt;</Button>
      </div>
    )
  }, [currentMonth, prevMonth, nextMonth])

  const renderDays = useMemo(() => {
    const dateFormat = "EEEE"
    const days = []
    let startDate = startOfWeek(currentMonth)
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="col-span-1 text-center text-gray-600 dark:text-gray-400">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      )
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>
  }, [currentMonth])

  const renderCells = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)
    const dateFormat = "d"
    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat)
        const cloneDay = day
        days.push(
          <div
            key={day.toString()}
            className={`col-span-1 p-2 border ${
              !isSameMonth(day, monthStart)
                ? "text-gray-400"
                : isSameDay(day, selectedDate)
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-300"
            }`}
            onClick={() => onDateClick(cloneDay)}
          >
            <span className="text-sm">{formattedDate}</span>
            {shifts
              .filter(shift => isSameDay(new Date(shift.date), cloneDay))
              .map(shift => (
                <div key={shift.id} className="text-xs mt-1 bg-gray-200 dark:bg-gray-700 p-1 rounded">
                  {shift.user.name}: {shift.startTime}-{shift.endTime}
                </div>
              ))}
          </div>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      )
      days = []
    }
    return <div className="mb-2">{rows}</div>
  }, [currentMonth, selectedDate, shifts, onDateClick])

  // ... rest of the component

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">Calendar</CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-4">
        {renderHeader}
        {renderDays}
        {renderCells}
        {/* ... other components */}
      </CardContent>
    </Card>
  )
})

export default Calendar

