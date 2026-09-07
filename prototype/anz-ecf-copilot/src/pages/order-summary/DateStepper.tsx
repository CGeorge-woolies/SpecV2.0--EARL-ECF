import { useState } from 'react'
import { ChevronLeftFilled, ChevronRightFilled, KeyboardArrowDownFilled } from '@/components/icons/material-icons'
import { CalendarTodayFooter } from '@/components/shared/CalendarTodayFooter'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import tokens from '@/theme/tokens'

interface DateStepperProps {
  selectedDate: Date
  onChange: (date: Date) => void
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function DateStepper({ selectedDate, onChange }: DateStepperProps) {
  const day = selectedDate.getDate()
  const monthYear = selectedDate
    .toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
    .toUpperCase()
  const weekday = selectedDate.toLocaleDateString('en-AU', { weekday: 'long' })
  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="border border-transparent hover:border-border hover:bg-white"
        onClick={() => onChange(addDays(selectedDate, -1))}
      >
        <ChevronLeftFilled />
      </Button>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger render={<Button variant="outline" className="h-auto items-start gap-2 bg-transparent px-3 py-1.5 hover:bg-white" />}>
          <span
            className="leading-tight"
            style={{
              fontFamily: tokens.fontFamily,
              fontSize: '28px',
              fontWeight: 700,
              color: tokens.colorTextStrong,
            }}
          >
            {day}
          </span>
          <div className="flex flex-col items-start leading-tight">
            <span
              style={{
                fontFamily: tokens.fontFamily,
                fontSize: tokens.fontSizeBodySm,
                fontWeight: 700,
                color: tokens.colorTextStrong,
              }}
            >
              {monthYear}
            </span>
            <span
              style={{
                fontFamily: tokens.fontFamily,
                fontSize: tokens.fontSizeCaption,
                color: tokens.colorTextMedium,
              }}
            >
              {weekday}
            </span>
          </div>
          <KeyboardArrowDownFilled className="self-center text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onChange(date)}
          />
          <CalendarTodayFooter
            onClick={() => {
              onChange(new Date())
              setPopoverOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        className="border border-transparent hover:border-border hover:bg-white"
        onClick={() => onChange(addDays(selectedDate, 1))}
      >
        <ChevronRightFilled />
      </Button>
    </div>
  )
}
