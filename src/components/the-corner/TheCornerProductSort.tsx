"use client"

import { ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface TheCornerProductSortProps {
  onSortChange: (sort: string, order: string) => void
  initialSort?: string
  initialOrder?: string
}

export function TheCornerProductSort({
  onSortChange,
  initialSort = "name",
  initialOrder = "asc",
}: TheCornerProductSortProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const options = [
    { label: "Nom (A-Z)", sort: "name", order: "asc" },
    { label: "Nom (Z-A)", sort: "name", order: "desc" },
    { label: "Prix croissant", sort: "price", order: "asc" },
    { label: "Prix décroissant", sort: "price", order: "desc" },
  ]

  const currentOption = options.find(
    (opt) => opt.sort === initialSort && opt.order === initialOrder
  ) || options[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        <span>{currentOption.label}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
          {options.map((option) => (
            <button
              key={`${option.sort}-${option.order}`}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              onClick={() => {
                onSortChange(option.sort, option.order)
                setIsOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 