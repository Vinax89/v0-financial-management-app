"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Coffee, Car, ShoppingCart, Home, Utensils, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuickTransaction {
  id: string
  name: string
  amount: number
  category: string
  icon: React.ReactNode
  color: string
}

export function QuickTransactionButtons() {
  const [quickTransactions] = useState<QuickTransaction[]>([
    {
      id: "1",
      name: "Coffee",
      amount: 5.5,
      category: "Food & Dining",
      icon: <Coffee className="h-4 w-4" />,
      color: "bg-amber-500",
    },
    {
      id: "2",
      name: "Gas",
      amount: 45.0,
      category: "Transportation",
      icon: <Car className="h-4 w-4" />,
      color: "bg-blue-500",
    },
    {
      id: "3",
      name: "Groceries",
      amount: 85.0,
      category: "Food & Dining",
      icon: <ShoppingCart className="h-4 w-4" />,
      color: "bg-green-500",
    },
    {
      id: "4",
      name: "Lunch",
      amount: 12.5,
      category: "Food & Dining",
      icon: <Utensils className="h-4 w-4" />,
      color: "bg-orange-500",
    },
    {
      id: "5",
      name: "Utilities",
      amount: 120.0,
      category: "Bills & Utilities",
      icon: <Home className="h-4 w-4" />,
      color: "bg-purple-500",
    },
  ])

  const [customAmount, setCustomAmount] = useState("")
  const { toast } = useToast()

  const handleQuickTransaction = async (transaction: QuickTransaction) => {
    try {
      // In real app, submit to Supabase
      console.log("Quick transaction:", transaction)

      toast({
        title: "Transaction Added",
        description: `${transaction.name} - $${transaction.amount.toFixed(2)} recorded successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCustomTransaction = async (transaction: QuickTransaction) => {
    const amount = Number.parseFloat(customAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      })
      return
    }

    await handleQuickTransaction({
      ...transaction,
      amount,
    })
    setCustomAmount("")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Add
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickTransactions.map((transaction) => (
            <div key={transaction.id} className="space-y-2">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-transform bg-transparent"
                onClick={() => handleQuickTransaction(transaction)}
              >
                <div className={`p-2 rounded-full text-white ${transaction.color}`}>{transaction.icon}</div>
                <span className="text-xs font-medium">{transaction.name}</span>
                <span className="text-xs text-muted-foreground">${transaction.amount}</span>
              </Button>

              <div className="flex space-x-1">
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Custom $"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="text-xs h-8"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => handleCustomTransaction(transaction)}
                  disabled={!customAmount}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Badge variant="secondary" className="text-xs w-full justify-center">
                {transaction.category}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
