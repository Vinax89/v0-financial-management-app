"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Plus, X, MapPin, Tag, Repeat } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: "income" | "expense" | "transfer"
}

interface Account {
  id: string
  name: string
  type: string
  balance: number
}

interface TransactionFormData {
  amount: string
  description: string
  notes: string
  categoryId: string
  accountId: string
  date: Date
  type: "income" | "expense" | "transfer"
  tags: string[]
  location: string
  isRecurring: boolean
  recurringFrequency: string
}

export function TransactionEntryForm() {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: "",
    description: "",
    notes: "",
    categoryId: "",
    accountId: "",
    date: new Date(),
    type: "expense",
    tags: [],
    location: "",
    isRecurring: false,
    recurringFrequency: "monthly",
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [quickAmounts] = useState([10, 25, 50, 100, 250, 500])
  const { toast } = useToast()

  // Mock data - in real app, fetch from Supabase
  useEffect(() => {
    setCategories([
      { id: "1", name: "Food & Dining", icon: "🍽️", color: "#ef4444", type: "expense" },
      { id: "2", name: "Transportation", icon: "🚗", color: "#3b82f6", type: "expense" },
      { id: "3", name: "Shopping", icon: "🛍️", color: "#ec4899", type: "expense" },
      { id: "4", name: "Salary", icon: "💼", color: "#10b981", type: "income" },
      { id: "5", name: "Freelance", icon: "💻", color: "#06b6d4", type: "income" },
    ])

    setAccounts([
      { id: "1", name: "Primary Checking", type: "checking", balance: 2500.0 },
      { id: "2", name: "Savings Account", type: "savings", balance: 15000.0 },
      { id: "3", name: "Credit Card", type: "credit", balance: -850.0 },
    ])
  }, [])

  const filteredCategories = categories.filter((cat) => cat.type === formData.type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In real app, submit to Supabase
      console.log("Submitting transaction:", formData)

      toast({
        title: "Transaction Added",
        description: `${formData.type === "income" ? "Income" : "Expense"} of $${formData.amount} has been recorded.`,
      })

      // Reset form
      setFormData({
        amount: "",
        description: "",
        notes: "",
        categoryId: "",
        accountId: "",
        date: new Date(),
        type: "expense",
        tags: [],
        location: "",
        isRecurring: false,
        recurringFrequency: "monthly",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const setQuickAmount = (amount: number) => {
    setFormData((prev) => ({ ...prev, amount: amount.toString() }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
        <CardDescription>Quickly record your income, expenses, and transfers</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type */}
          <Tabs
            value={formData.type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, type: value as "income" | "expense" | "transfer", categoryId: "" }))
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="expense" className="text-red-600">
                Expense
              </TabsTrigger>
              <TabsTrigger value="income" className="text-green-600">
                Income
              </TabsTrigger>
              <TabsTrigger value="transfer" className="text-blue-600">
                Transfer
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount */}
          <div className="space-y-3">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                className="text-2xl font-bold"
                required
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickAmount(amount)}
                  className="text-xs"
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this transaction for?"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account */}
            <div className="space-y-2">
              <Label>Account</Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, accountId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{account.name}</span>
                        <span
                          className={cn(
                            "text-sm font-medium",
                            account.balance >= 0 ? "text-green-600" : "text-red-600",
                          )}
                        >
                          ${Math.abs(account.balance).toFixed(2)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData((prev) => ({ ...prev, date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Where did this transaction occur?"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this transaction..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Recurring Transaction */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center space-x-2">
                <Repeat className="h-4 w-4" />
                <span>Recurring Transaction</span>
              </Label>
              <p className="text-sm text-muted-foreground">Set up automatic recurring transactions</p>
            </div>
            <Switch
              checked={formData.isRecurring}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isRecurring: checked }))}
            />
          </div>

          {formData.isRecurring && (
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={formData.recurringFrequency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, recurringFrequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adding Transaction..." : "Add Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
