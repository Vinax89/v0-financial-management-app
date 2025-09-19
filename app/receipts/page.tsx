"use client"

import React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Check, X, Eye, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ReceiptUpload } from "@/components/receipt-upload"

interface Receipt {
  id: string
  created_at: string
  file_name: string
  merchant_name: string | null
  total_amount: number | null
  transaction_date: string | null
  items: any[] | null
  processing_status: string
  confidence_score: number | null
}

const ReceiptItem = React.memo(({ receipt }: { receipt: Receipt }) => {
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }, [])

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-3 w-3" />
      case "processing":
        return <Loader2 className="h-3 w-3 animate-spin" />
      case "failed":
        return <X className="h-3 w-3" />
      default:
        return <FileText className="h-3 w-3" />
    }
  }, [])

  const formattedDate = useMemo(() => {
    const date = receipt.transaction_date || receipt.created_at
    return new Date(date).toLocaleDateString()
  }, [receipt.transaction_date, receipt.created_at])

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">{receipt.merchant_name || receipt.file_name}</p>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
          {receipt.confidence_score && (
            <p className="text-xs text-muted-foreground">Confidence: {Math.round(receipt.confidence_score * 100)}%</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="font-medium">{receipt.total_amount ? `$${receipt.total_amount.toFixed(2)}` : "—"}</p>
        </div>

        <Badge className={getStatusColor(receipt.processing_status)}>
          {getStatusIcon(receipt.processing_status)}
          <span className="ml-1 capitalize">{receipt.processing_status}</span>
        </Badge>

        {receipt.items && receipt.items.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Receipt Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="space-y-2">
                    {receipt.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>${item.price?.toFixed(2) || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {receipt.total_amount && (
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${receipt.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
})

ReceiptItem.displayName = "ReceiptItem"

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const fetchReceipts = useCallback(async () => {
    try {
      const response = await fetch("/api/receipts")
      if (!response.ok) throw new Error("Failed to fetch receipts")

      const data = await response.json()
      setReceipts(data.receipts || [])
    } catch (error) {
      console.error("Error fetching receipts:", error)
      toast({
        title: "Error",
        description: "Failed to load receipts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchReceipts()
  }, [fetchReceipts])

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files || files.length === 0) return

      setUploading(true)

      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/receipts/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`)
          }

          return response.json()
        })

        const results = await Promise.allSettled(uploadPromises)

        let successCount = 0
        let errorCount = 0

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            successCount++
            toast({
              title: "Success",
              description: `Receipt processed: ${result.value.extractedData.merchantName || "Unknown merchant"}`,
            })
          } else {
            errorCount++
            console.error(`Upload failed for file ${index}:`, result.reason)
          }
        })

        if (errorCount > 0) {
          toast({
            title: "Partial Success",
            description: `${successCount} receipts processed, ${errorCount} failed`,
            variant: "destructive",
          })
        }

        // Refresh receipts list
        await fetchReceipts()
      } catch (error) {
        console.error("Upload error:", error)
        toast({
          title: "Error",
          description: "Failed to process receipts",
          variant: "destructive",
        })
      } finally {
        setUploading(false)
        // Reset file input
        event.target.value = ""
      }
    },
    [toast, fetchReceipts],
  )

  const receiptList = useMemo(() => {
    return receipts.map((receipt) => <ReceiptItem key={receipt.id} receipt={receipt} />)
  }, [receipts])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Receipt Scanner</h1>
          <p className="text-muted-foreground">Upload receipts for automatic expense tracking</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">Drag and drop receipt images or click to browse</p>
              <Input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <Button asChild variant="outline" disabled={uploading}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Choose Files"
                  )}
                </label>
              </Button>
            </div>

            <ReceiptUpload onUploadComplete={fetchReceipts} />
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Receipts ({receipts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No receipts uploaded yet</p>
              <p className="text-sm">Upload your first receipt to get started</p>
            </div>
          ) : (
            <div className="space-y-4">{receiptList}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
