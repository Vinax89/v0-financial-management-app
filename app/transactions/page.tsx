"use client"

import React, { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Search, Tag, Calendar, DollarSign } from "lucide-react"
import { TransactionList } from "@/components/transaction-list"
import { ImportTransactionsDialog } from "@/components/import-transactions-dialog"
import { CategorizeTransactionsDialog } from "@/components/categorize-transactions-dialog"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  subcategory?: string
  account: string
  type: "income" | "expense"
  isRecurring: boolean
  confidence?: number
  needsReview?: boolean
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    date: "2024-01-15",
    description: "Grocery Store Purchase",
    amount: -85.32,
    category: "Food & Groceries",
    subcategory: "Groceries",
    account: "Checking",
    type: "expense",
    isRecurring: false,
    confidence: 0.95,
  },
  {
    id: "2",
    date: "2024-01-14",
    description: "Paycheck Deposit",
    amount: 1200.0,
    category: "Income",
    subcategory: "Salary",
    account: "Checking",
    type: "income",
    isRecurring: true,
    confidence: 1.0,
  },
  {
    id: "3",
    date: "2024-01-13",
    description: "Gas Station",
    amount: -45.67,
    category: "Transportation",
    subcategory: "Fuel",
    account: "Credit Card",
    type: "expense",
    isRecurring: false,
    confidence: 0.88,
  },
  {
    id: "4",
    date: "2024-01-12",
    description: "Netflix Subscription",
    amount: -15.99,
    category: "Entertainment",
    subcategory: "Streaming",
    account: "Credit Card",
    type: "expense",
    isRecurring: true,
    confidence: 0.99,
  },
  {
    id: "5",
    date: "2024-01-11",
    description: "Unknown Merchant",
    amount: -23.45,
    category: "Uncategorized",
    account: "Checking",
    type: "expense",
    isRecurring: false,
    needsReview: true,
    confidence: 0.2,
  },
]

const TransactionsPage = React.memo(() => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedAccount, setSelectedAccount] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("30")
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showCategorizeDialog, setShowCategorizeDialog] = useState(false)

  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((transaction) => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory
      const matchesAccount = selectedAccount === "all" || transaction.account === selectedAccount
      return matchesSearch && matchesCategory && matchesAccount
    })
  }, [searchTerm, selectedCategory, selectedAccount])

  const statistics = useMemo(() => {
    const uncategorizedCount = MOCK_TRANSACTIONS.filter((t) => t.category === "Uncategorized").length
    const needsReviewCount = MOCK_TRANSACTIONS.filter((t) => t.needsReview).length
    const totalIncome = MOCK_TRANSACTIONS.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = MOCK_TRANSACTIONS.filter((t) => t.type === "expense").reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0,
    )

    return {
      uncategorizedCount,
      needsReviewCount,
      totalIncome,
      totalExpenses,
    }
  }, [])

  const { categories, accounts } = useMemo(() => {
    const categories = Array.from(new Set(MOCK_TRANSACTIONS.map((t) => t.category))).filter(
      (cat) => cat !== "Uncategorized",
    )
    const accounts = Array.from(new Set(MOCK_TRANSACTIONS.map((t) => t.account)))
    return { categories, accounts }
  }, [])

  const tabCounts = useMemo(
    () => ({
      all: filteredTransactions.length,
      income: filteredTransactions.filter((t) => t.type === "income").length,
      expenses: filteredTransactions.filter((t) => t.type === "expense").length,
      uncategorized: filteredTransactions.filter((t) => t.category === "Uncategorized").length,
    }),
    [filteredTransactions],
  )

  const transactionsByType = useMemo(
    () => ({
      income: filteredTransactions.filter((t) => t.type === "income"),
      expenses: filteredTransactions.filter((t) => t.type === "expense"),
      uncategorized: filteredTransactions.filter((t) => t.category === "Uncategorized"),
    }),
    [filteredTransactions],
  )

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value)
  }, [])

  const handleAccountChange = useCallback((value: string) => {
    setSelectedAccount(value)
  }, [])

  const handleDateRangeChange = useCallback((value: string) => {
    setDateRange(value)
  }, [])

  const handleImportDialogChange = useCallback((open: boolean) => {
    setShowImportDialog(open)
  }, [])

  const handleCategorizeDialogChange = useCallback((open: boolean) => {
    setShowCategorizeDialog(open)
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground">Import, categorize, and manage your financial transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowImportDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setShowCategorizeDialog(true)} disabled={statistics.uncategorizedCount === 0}>
              <Tag className="w-4 h-4 mr-2" />
              Categorize ({statistics.uncategorizedCount})
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${statistics.totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${statistics.totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${statistics.totalIncome - statistics.totalExpenses >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ${Math.abs(statistics.totalIncome - statistics.totalExpenses).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.totalIncome - statistics.totalExpenses >= 0 ? "Positive" : "Negative"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
              <Tag className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{statistics.needsReviewCount}</div>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAccount} onValueChange={handleAccountChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account} value={account}>
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All Transactions
              <Badge variant="secondary" className="ml-1">
                {tabCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="income">
              Income
              <Badge variant="secondary" className="ml-1">
                {tabCounts.income}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="expenses">
              Expenses
              <Badge variant="secondary" className="ml-1">
                {tabCounts.expenses}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="uncategorized">
              Uncategorized
              <Badge variant="secondary" className="ml-1">
                {tabCounts.uncategorized}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TransactionList transactions={filteredTransactions} />
          </TabsContent>

          <TabsContent value="income">
            <TransactionList transactions={transactionsByType.income} />
          </TabsContent>

          <TabsContent value="expenses">
            <TransactionList transactions={transactionsByType.expenses} />
          </TabsContent>

          <TabsContent value="uncategorized">
            <TransactionList transactions={transactionsByType.uncategorized} />
          </TabsContent>
        </Tabs>

        <ImportTransactionsDialog open={showImportDialog} onOpenChange={handleImportDialogChange} />
        <CategorizeTransactionsDialog open={showCategorizeDialog} onOpenChange={handleCategorizeDialogChange} />
      </div>
    </div>
  )
})

TransactionsPage.displayName = "TransactionsPage"

export default TransactionsPage
