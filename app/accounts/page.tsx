"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, CreditCard, PiggyBank, TrendingUp, RefreshCw, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Account {
  id: string
  name: string
  type: "checking" | "savings" | "credit" | "investment"
  balance: number
  institution: string
  lastSync: string
  status: "connected" | "error" | "syncing"
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "1",
      name: "Primary Checking",
      type: "checking",
      balance: 2847.32,
      institution: "Chase Bank",
      lastSync: "2024-01-15T10:30:00Z",
      status: "connected",
    },
    {
      id: "2",
      name: "High Yield Savings",
      type: "savings",
      balance: 15420.18,
      institution: "Marcus by Goldman Sachs",
      lastSync: "2024-01-15T10:30:00Z",
      status: "connected",
    },
    {
      id: "3",
      name: "Freedom Unlimited",
      type: "credit",
      balance: -1247.89,
      institution: "Chase Bank",
      lastSync: "2024-01-15T10:30:00Z",
      status: "connected",
    },
    {
      id: "4",
      name: "Roth IRA",
      type: "investment",
      balance: 8932.45,
      institution: "Fidelity",
      lastSync: "2024-01-15T09:15:00Z",
      status: "error",
    },
  ])

  const getAccountIcon = (type: Account["type"]) => {
    switch (type) {
      case "checking":
        return <Building2 className="h-5 w-5" />
      case "savings":
        return <PiggyBank className="h-5 w-5" />
      case "credit":
        return <CreditCard className="h-5 w-5" />
      case "investment":
        return <TrendingUp className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: Account["status"]) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "syncing":
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const formatBalance = (balance: number, type: Account["type"]) => {
    const formatted = Math.abs(balance).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })

    if (type === "credit") {
      return balance < 0 ? `-${formatted}` : formatted
    }
    return formatted
  }

  const totalNetWorth = accounts.reduce((sum, account) => {
    if (account.type === "credit") {
      return sum + account.balance // Credit balances are negative
    }
    return sum + account.balance
  }, 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Connected Accounts</h1>
          <p className="text-muted-foreground">Manage your bank accounts and financial institutions</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Connect Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect New Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="institution">Search for your bank</Label>
                <Input id="institution" placeholder="e.g., Chase, Bank of America, Wells Fargo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Building2 className="h-6 w-6 mb-2" />
                  <span className="text-sm">Major Banks</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <CreditCard className="h-6 w-6 mb-2" />
                  <span className="text-sm">Credit Cards</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span className="text-sm">Investments</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <PiggyBank className="h-6 w-6 mb-2" />
                  <span className="text-sm">Credit Unions</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your data is encrypted and secure. We use bank-level security through Plaid.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Net Worth Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Net Worth Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {totalNetWorth.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Across {accounts.length} connected accounts</p>
        </CardContent>
      </Card>

      {/* Accounts List */}
      <div className="grid gap-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getAccountIcon(account.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{account.name}</h3>
                    <p className="text-sm text-muted-foreground">{account.institution}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatBalance(account.balance, account.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      Last sync: {new Date(account.lastSync).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(account.status)}>
                      {account.status === "error" && <AlertCircle className="h-3 w-3 mr-1" />}
                      {account.status === "syncing" && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                      <span className="capitalize">{account.status}</span>
                    </Badge>

                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
