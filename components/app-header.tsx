"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

// Page title mapping
const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/budget": "Budget Management",
  "/transactions": "Transactions",
  "/accounts": "Connected Accounts",
  "/calendar": "Calendar & Shifts",
  "/calculator": "Financial Calculator",
  "/receipts": "Receipt Scanner",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/settings": "Settings",
}

export const AppHeader = React.memo(function AppHeader() {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()
  const [searchQuery, setSearchQuery] = React.useState("")

  const currentTitle = React.useMemo(() => pageTitles[pathname] || "ShiftBudget", [pathname])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>

          <div>
            <h1 className="text-xl font-semibold text-foreground">{currentTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9 transition-all duration-200 focus:w-80"
            />
          </div>

          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Budget Alert</p>
                  <p className="text-xs text-muted-foreground">You’ve spent 85% of your dining budget this period</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Upcoming Bill</p>
                  <p className="text-xs text-muted-foreground">Rent payment due in 3 days ($1,200)</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Paycheck Received</p>
                  <p className="text-xs text-muted-foreground">$2,450 deposited to checking account</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
})
