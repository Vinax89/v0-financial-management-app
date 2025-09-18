"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react"

interface CategorizeTransactionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UncategorizedTransaction {
  id: string
  description: string
  amount: number
  date: string
  suggestedCategory: string
  confidence: number
  alternativeCategories: string[]
}

export function CategorizeTransactionsDialog({ open, onOpenChange }: CategorizeTransactionsDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0)
  const [categorizedCount, setCategorizedCount] = useState(0)

  // Mock uncategorized transactions
  const uncategorizedTransactions: UncategorizedTransaction[] = [
    {
      id: "1",
      description: "AMAZON.COM AMZN.COM/BILL",
      amount: -67.89,
      date: "2024-01-10",
      suggestedCategory: "Shopping",
      confidence: 0.92,
      alternativeCategories: ["Entertainment", "Home & Garden", "Electronics"],
    },
    {
      id: "2",
      description: "SHELL OIL 12345",
      amount: -45.32,
      date: "2024-01-09",
      suggestedCategory: "Transportation",
      confidence: 0.98,
      alternativeCategories: ["Fuel", "Auto & Transport"],
    },
    {
      id: "3",
      description: "UNKNOWN MERCHANT",
      amount: -23.45,
      date: "2024-01-08",
      suggestedCategory: "Miscellaneous",
      confidence: 0.15,
      alternativeCategories: ["Shopping", "Food & Dining", "Entertainment"],
    },
  ]

  const [transactions, setTransactions] = useState(uncategorizedTransactions)

  const handleAutoCategorizeBatch = async () => {
    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate AI categorization process
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          setCategorizedCount(transactions.filter((t) => t.confidence >= 0.7).length)
          return 100
        }
        return prev + 20
      })
    }, 300)
  }

  const handleCategoryChange = (transactionId: string, newCategory: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === transactionId ? { ...t, suggestedCategory: newCategory, confidence: 1.0 } : t)),
    )
  }

  const handleApplyCategories = () => {
    // In real app, this would save categories to database
    console.log("Applying categories:", transactions)
    onOpenChange(false)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.5) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return "High"
    if (confidence >= 0.5) return "Medium"
    return "Low"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI-Powered Transaction Categorization
          </DialogTitle>
          <DialogDescription>
            Review and approve AI-suggested categories for your uncategorized transactions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Auto-categorize Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Batch Categorization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isProcessing && categorizedCount === 0 ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-categorize with AI</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically categorize transactions with high confidence scores
                    </p>
                  </div>
                  <Button onClick={handleAutoCategorizeBatch}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Auto-Categorize
                  </Button>
                </div>
              ) : isProcessing ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing transactions...</span>
                    <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {categorizedCount} transactions automatically categorized with high confidence
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Individual Transactions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review Individual Transactions</h3>
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{transaction.description}</span>
                          <Badge
                            variant={transaction.confidence >= 0.8 ? "default" : "secondary"}
                            className={getConfidenceColor(transaction.confidence)}
                          >
                            {getConfidenceBadge(transaction.confidence)} Confidence
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()} • $
                          {Math.abs(transaction.amount).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Suggested Category</label>
                        <Select
                          value={transaction.suggestedCategory}
                          onValueChange={(value) => handleCategoryChange(transaction.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={transaction.suggestedCategory}>
                              {transaction.suggestedCategory} (AI Suggested)
                            </SelectItem>
                            {transaction.alternativeCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                            <SelectItem value="Food & Groceries">Food & Groceries</SelectItem>
                            <SelectItem value="Transportation">Transportation</SelectItem>
                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                            <SelectItem value="Utilities">Utilities</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Shopping">Shopping</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Alternative Suggestions</label>
                        <div className="flex flex-wrap gap-1">
                          {transaction.alternativeCategories.map((category) => (
                            <Badge
                              key={category}
                              variant="outline"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                              onClick={() => handleCategoryChange(transaction.id, category)}
                            >
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {transaction.confidence < 0.5 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            Low confidence categorization. Please review and select the most appropriate category.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyCategories}>Apply Categories</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
