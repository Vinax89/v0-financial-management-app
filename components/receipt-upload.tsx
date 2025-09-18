"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Camera, CheckCircle, AlertCircle, RefreshCw, Eye, Edit, Trash2 } from "lucide-react"

interface ReceiptUploadProps {
  userId: string
  onUploadComplete?: (receiptId: string) => void
}

interface UploadedReceipt {
  id: string
  fileName: string
  fileUrl: string
  status: "uploaded" | "processing" | "completed" | "failed"
  progress: number
  merchantName?: string
  totalAmount?: number
  extractedData?: any
  confidence?: number
}

export function ReceiptUpload({ userId, onUploadComplete }: ReceiptUploadProps) {
  const [uploadedReceipts, setUploadedReceipts] = useState<UploadedReceipt[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<UploadedReceipt | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState<any>({})

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)

    for (const file of acceptedFiles) {
      try {
        // Create receipt record
        const newReceipt: UploadedReceipt = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          status: "uploaded",
          progress: 0,
        }

        setUploadedReceipts((prev) => [newReceipt, ...prev])

        // Simulate upload and processing
        await simulateReceiptProcessing(newReceipt, file)
      } catch (error) {
        console.error("Upload failed:", error)
      }
    }

    setIsUploading(false)
  }, [])

  const simulateReceiptProcessing = async (receipt: UploadedReceipt, file: File) => {
    // Update status to processing
    setUploadedReceipts((prev) =>
      prev.map((r) => (r.id === receipt.id ? { ...r, status: "processing", progress: 10 } : r)),
    )

    // Simulate processing steps
    const steps = [
      { progress: 25, message: "Uploading image..." },
      { progress: 50, message: "Extracting text..." },
      { progress: 75, message: "Parsing data..." },
      { progress: 90, message: "Categorizing..." },
      { progress: 100, message: "Complete!" },
    ]

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUploadedReceipts((prev) => prev.map((r) => (r.id === receipt.id ? { ...r, progress: step.progress } : r)))
    }

    // Simulate extracted data
    const extractedData = {
      merchantName: file.name.includes("starbucks")
        ? "Starbucks"
        : file.name.includes("walmart")
          ? "Walmart"
          : file.name.includes("target")
            ? "Target"
            : "Sample Store",
      totalAmount: Math.floor(Math.random() * 100) + 10,
      transactionDate: new Date(),
      suggestedCategory: "Food & Dining",
      confidence: 0.85 + Math.random() * 0.1,
      lineItems: [
        { name: "Coffee", quantity: 1, unitPrice: 4.95, totalPrice: 4.95 },
        { name: "Pastry", quantity: 1, unitPrice: 3.5, totalPrice: 3.5 },
      ],
    }

    // Update with final data
    setUploadedReceipts((prev) =>
      prev.map((r) =>
        r.id === receipt.id
          ? {
              ...r,
              status: "completed",
              progress: 100,
              merchantName: extractedData.merchantName,
              totalAmount: extractedData.totalAmount,
              extractedData,
              confidence: extractedData.confidence,
            }
          : r,
      ),
    )

    onUploadComplete?.(receipt.id)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "processing":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "processing":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleEdit = (receipt: UploadedReceipt) => {
    setSelectedReceipt(receipt)
    setEditData({
      merchantName: receipt.merchantName || "",
      totalAmount: receipt.totalAmount || 0,
      transactionDate: receipt.extractedData?.transactionDate?.toISOString().split("T")[0] || "",
      suggestedCategory: receipt.extractedData?.suggestedCategory || "Other",
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedReceipt) return

    try {
      // Update receipt data
      setUploadedReceipts((prev) =>
        prev.map((r) =>
          r.id === selectedReceipt.id
            ? {
                ...r,
                merchantName: editData.merchantName,
                totalAmount: Number.parseFloat(editData.totalAmount),
                extractedData: {
                  ...r.extractedData,
                  merchantName: editData.merchantName,
                  totalAmount: Number.parseFloat(editData.totalAmount),
                  transactionDate: new Date(editData.transactionDate),
                  suggestedCategory: editData.suggestedCategory,
                },
              }
            : r,
        ),
      )

      setIsEditDialogOpen(false)
      setSelectedReceipt(null)
    } catch (error) {
      console.error("Failed to update receipt:", error)
    }
  }

  const handleDelete = (receiptId: string) => {
    if (confirm("Are you sure you want to delete this receipt?")) {
      setUploadedReceipts((prev) => prev.filter((r) => r.id !== receiptId))
    }
  }

  const submitFeedback = async (receiptId: string, rating: number, comments: string) => {
    try {
      console.log("[v0] Submitting feedback:", { receiptId, rating, comments })
      // Here you would call your API to submit feedback
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Receipts
          </CardTitle>
          <CardDescription>
            Take a photo or upload images of your receipts for automatic data extraction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop the receipt images here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop receipt images, or click to select</p>
                <p className="text-sm text-muted-foreground">Supports PNG, JPG, JPEG, GIF, BMP, WebP up to 10MB</p>
              </div>
            )}
          </div>

          {isUploading && (
            <Alert className="mt-4">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <AlertDescription>Processing receipts... This may take a few moments.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Receipts */}
      {uploadedReceipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>Review and manage your uploaded receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                {uploadedReceipts.map((receipt) => (
                  <div key={receipt.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(receipt.status)}
                        <div>
                          <h4 className="font-medium">{receipt.fileName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {receipt.merchantName && `${receipt.merchantName} • `}
                            {receipt.totalAmount && `$${receipt.totalAmount.toFixed(2)} • `}
                            {receipt.confidence && `${(receipt.confidence * 100).toFixed(0)}% confidence`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(receipt.status)}>{receipt.status}</Badge>
                        {receipt.status === "completed" && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(receipt)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(receipt)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleDelete(receipt.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {receipt.status === "processing" && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Processing...</span>
                          <span>{receipt.progress}%</span>
                        </div>
                        <Progress value={receipt.progress} className="h-2" />
                      </div>
                    )}

                    {receipt.status === "completed" && receipt.extractedData && (
                      <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-4 text-sm">
                        <div>
                          <span className="font-medium">Merchant:</span>
                          <div>{receipt.extractedData.merchantName}</div>
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span>
                          <div>${receipt.extractedData.totalAmount?.toFixed(2)}</div>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <div>{receipt.extractedData.suggestedCategory}</div>
                        </div>
                        <div>
                          <span className="font-medium">Items:</span>
                          <div>{receipt.extractedData.lineItems?.length || 0} items</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="grid" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {uploadedReceipts.map((receipt) => (
                    <Card key={receipt.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-[3/4] bg-muted rounded-lg mb-3 flex items-center justify-center">
                          <img
                            src={receipt.fileUrl || "/placeholder.svg"}
                            alt={receipt.fileName}
                            className="max-w-full max-h-full object-contain rounded-lg"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{receipt.merchantName || receipt.fileName}</h4>
                            {getStatusIcon(receipt.status)}
                          </div>
                          {receipt.totalAmount && (
                            <div className="text-lg font-bold">${receipt.totalAmount.toFixed(2)}</div>
                          )}
                          {receipt.extractedData?.suggestedCategory && (
                            <Badge variant="outline">{receipt.extractedData.suggestedCategory}</Badge>
                          )}
                          {receipt.confidence && (
                            <div className="text-xs text-muted-foreground">
                              {(receipt.confidence * 100).toFixed(0)}% confidence
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Receipt Detail Dialog */}
      {selectedReceipt && !isEditDialogOpen && (
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Receipt Details</DialogTitle>
              <DialogDescription>Review extracted data from {selectedReceipt.fileName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
                  <img
                    src={selectedReceipt.fileUrl || "/placeholder.svg"}
                    alt={selectedReceipt.fileName}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Merchant</Label>
                    <div className="text-lg">{selectedReceipt.merchantName}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Total Amount</Label>
                    <div className="text-2xl font-bold">${selectedReceipt.totalAmount?.toFixed(2)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Badge>{selectedReceipt.extractedData?.suggestedCategory}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Confidence</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={(selectedReceipt.confidence || 0) * 100} className="flex-1" />
                      <span className="text-sm">{((selectedReceipt.confidence || 0) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedReceipt.extractedData?.lineItems && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">Line Items</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedReceipt.extractedData.lineItems.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.quantity} × ${item.unitPrice?.toFixed(2)}
                          </div>
                        </div>
                        <div className="font-medium">${item.totalPrice?.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => handleEdit(selectedReceipt)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setSelectedReceipt(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {isEditDialogOpen && selectedReceipt && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Receipt Data</DialogTitle>
              <DialogDescription>Correct any inaccuracies in the extracted data</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="merchant">Merchant Name</Label>
                <Input
                  id="merchant"
                  value={editData.merchantName}
                  onChange={(e) => setEditData((prev) => ({ ...prev, merchantName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Total Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={editData.totalAmount}
                  onChange={(e) => setEditData((prev) => ({ ...prev, totalAmount: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Transaction Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={editData.transactionDate}
                  onChange={(e) => setEditData((prev) => ({ ...prev, transactionDate: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editData.suggestedCategory}
                  onValueChange={(value) => setEditData((prev) => ({ ...prev, suggestedCategory: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Bills & Utilities">Bills & Utilities</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveEdit}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
