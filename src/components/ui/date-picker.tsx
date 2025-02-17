"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { DayPicker, SelectSingleEventHandler } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type DatePickerProps = Omit<React.ComponentProps<typeof DayPicker>, "mode" | "selected" | "onSelect"> & {
  onSelect?: (date: Date | undefined) => void
}

export function DatePicker({ className, onSelect, ...props }: DatePickerProps) {
  const [date, setDate] = React.useState<Date>()

  const handleSelect: SelectSingleEventHandler = (selectedDate) => {
    setDate(selectedDate)
    if (onSelect) {
      onSelect(selectedDate)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            locale={fr}
            {...props}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

