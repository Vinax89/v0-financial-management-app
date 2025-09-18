"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react"

interface EventFiltersProps {
  selectedFilters: string[]
  onFiltersChange: (filters: string[]) => void
}

export function EventFilters({ selectedFilters, onFiltersChange }: EventFiltersProps) {
  const filterOptions = [
    { value: "shift", label: "Shifts", color: "bg-blue-500" },
    { value: "bill", label: "Bills", color: "bg-red-500" },
    { value: "payday", label: "Paydays", color: "bg-green-500" },
    { value: "subscription", label: "Subscriptions", color: "bg-purple-500" },
    { value: "payment", label: "Payments", color: "bg-orange-500" },
    { value: "goal", label: "Goals", color: "bg-yellow-500" },
  ]

  const toggleFilter = (filterValue: string) => {
    if (selectedFilters.includes(filterValue)) {
      onFiltersChange(selectedFilters.filter((f) => f !== filterValue))
    } else {
      onFiltersChange([...selectedFilters, filterValue])
    }
  }

  const clearFilters = () => {
    onFiltersChange([])
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
            {selectedFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedFilters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {filterOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selectedFilters.includes(option.value)}
              onCheckedChange={() => toggleFilter(option.value)}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${option.color}`} />
                {option.label}
              </div>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedFilters.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      )}
    </div>
  )
}
