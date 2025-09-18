"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, AlertCircle, CheckCircle, Download, Eye, RefreshCw, Database, Zap } from "lucide-react"

interface ImportJob {
  id: string
  fileName: string
  fileSize: number
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  totalRows: number
  processedRows: number
  validRows: number
  errorRows: number
  errors: ImportError[]
  createdAt: Date
  completedAt?: Date
}

interface ImportError {
  row: number
  field: string
  message: string
  value: string
}

interface TransactionPreview {
  row: number
  date: string
  description: string
  amount: number
  category?: string
  account?: string
  isValid: boolean
  errors: string[]
}

export default function TransactionImportPage() {
  const [importJobs, setImportJobs] = useState<ImportJob[]>([])
  const [currentJob, setCurrentJob] = useState<ImportJob | null>(null)
  const [previewData, setPreviewData] = useState<TransactionPreview[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [mappingConfig, setMappingConfig] = useState({
    dateColumn: "",
    descriptionColumn: "",
    amountColumn: "",
    categoryColumn: "",
    accountColumn: "",
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const newJob: ImportJob = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        status: "pending",
        progress: 0,
        totalRows: 0,
        processedRows: 0,
        validRows: 0,
        errorRows: 0,
        errors: [],
        createdAt: new Date(),
      }

      setImportJobs((prev) => [newJob, ...prev])
      setCurrentJob(newJob)

      // Simulate file processing
      processFile(file, newJob)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: true,
  })

  const processFile = async (file: File, job: ImportJob) => {
    setIsProcessing(true)

    try {
      // Update job status
      const updatedJob = { ...job, status: "processing" as const }
      setCurrentJob(updatedJob)
      setImportJobs((prev) => prev.map((j) => (j.id === job.id ? updatedJob : j)))

      // Simulate file reading and processing
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        const lines = text.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

        // Generate preview data
        const preview: TransactionPreview[] = []
        const errors: ImportError[] = []

        for (let i = 1; i < Math.min(lines.length, 101); i++) {
          // Preview first 100 rows
          const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

          if (values.length < 3) continue // Skip empty rows

          const transaction: TransactionPreview = {
            row: i,
            date: values[0] || "",
            description: values[1] || "",
            amount: Number.parseFloat(values[2]) || 0,
            category: values[3] || "",
            account: values[4] || "",
            isValid: true,
            errors: [],
          }

          // Validate transaction
          if (!transaction.date) {
            transaction.isValid = false
            transaction.errors.push("Missing date")
            errors.push({ row: i, field: "date", message: "Date is required", value: transaction.date })
          }

          if (!transaction.description) {
            transaction.isValid = false
            transaction.errors.push("Missing description")
            errors.push({
              row: i,
              field: "description",
              message: "Description is required",
              value: transaction.description,
            })
          }

          if (isNaN(transaction.amount) || transaction.amount === 0) {
            transaction.isValid = false
            transaction.errors.push("Invalid amount")
            errors.push({ row: i, field: "amount", message: "Valid amount is required", value: values[2] })
          }

          preview.push(transaction)
        }

        setPreviewData(preview)

        // Simulate processing progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 200))

          const updatedJob = {
            ...job,
            status: "processing" as const,
            progress,
            totalRows: lines.length - 1,
            processedRows: Math.floor((lines.length - 1) * (progress / 100)),
            validRows: preview.filter((p) => p.isValid).length,
            errorRows: preview.filter((p) => !p.isValid).length,
            errors,
          }

          setCurrentJob(updatedJob)
          setImportJobs((prev) => prev.map((j) => (j.id === job.id ? updatedJob : j)))
        }

        // Complete processing
        const completedJob = {
          ...job,
          status: "completed" as const,
          progress: 100,
          totalRows: lines.length - 1,
          processedRows: lines.length - 1,
          validRows: preview.filter((p) => p.isValid).length,
          errorRows: preview.filter((p) => !p.isValid).length,
          errors,
          completedAt: new Date(),
        }

        setCurrentJob(completedJob)
        setImportJobs((prev) => prev.map((j) => (j.id === job.id ? completedJob : j)))
      }

      reader.readAsText(file)
    } catch (error) {
      console.error("Failed to process file:", error)

      const failedJob = {
        ...job,
        status: "failed" as const,
        errors: [{ row: 0, field: "file", message: "Failed to read file", value: file.name }],
        completedAt: new Date(),
      }

      setCurrentJob(failedJob)
      setImportJobs((prev) => prev.map((j) => (j.id === job.id ? failedJob : j)))
    } finally {
      setIsProcessing(false)
    }
  }

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

  const handleRowSelection = (row: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, row])
    } else {
      setSelectedRows((prev) => prev.filter((r) => r !== row))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(previewData.filter((p) => p.isValid).map((p) => p.row))
    } else {
      setSelectedRows([])
    }
  }

  const importSelectedTransactions = async () => {
    if (selectedRows.length === 0) return

    setIsProcessing(true)
    try {
      // Simulate import process
      console.log("[v0] Importing selected transactions:", selectedRows.length)

      // Here you would call your API to import the selected transactions
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Show success message or redirect
      alert(`Successfully imported ${selectedRows.length} transactions!`)
      setSelectedRows([])
    } catch (error) {
      console.error("Failed to import transactions:", error)
      alert("Failed to import transactions. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Import Transactions</h1>
          <p className="text-muted-foreground">Upload and import transaction data from CSV, Excel, or bank files</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
          <Button variant="outline">
            <Database className="w-4 h-4 mr-2" />
            Connect Bank
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Transaction Files</CardTitle>
          <CardDescription>
            Drag and drop your CSV, Excel, or bank export files here, or click to browse
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
              <p className="text-lg">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-muted-foreground">Supports CSV, Excel (.xlsx, .xls) files up to 10MB</p>
              </div>
            )}
          </div>

          {/* Supported Formats */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Supported Formats:</h4>
            <div className="grid gap-2 md:grid-cols-3 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                <span>CSV files (.csv)</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Excel files (.xlsx, .xls)</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Bank exports (OFX, QIF)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Import Jobs</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
          <TabsTrigger value="mapping">Column Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {importJobs.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No import jobs yet</h3>
                  <p className="text-muted-foreground">Upload a file to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {importJobs.map((job) => (
                <Card
                  key={job.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setCurrentJob(job)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h4 className="font-medium">{job.fileName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {(job.fileSize / 1024).toFixed(1)} KB • {job.createdAt.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {job.processedRows.toLocaleString()} / {job.totalRows.toLocaleString()}
                          </div>
                          <div className="text-muted-foreground">
                            {job.validRows} valid, {job.errorRows} errors
                          </div>
                        </div>
                        <Badge variant={getStatusColor(job.status)}>{job.status}</Badge>
                      </div>
                    </div>

                    {job.status === "processing" && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Processing...</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}

                    {job.errors.length > 0 && (
                      <Alert className="mt-4" variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle>Import Errors</AlertTitle>
                        <AlertDescription>{job.errors.length} error(s) found. Click to view details.</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {previewData.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No data to preview</h3>
                  <p className="text-muted-foreground">Upload a file to see the data preview</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Data Preview</CardTitle>
                    <CardDescription>
                      Review and select transactions to import ({previewData.filter((p) => p.isValid).length} valid,{" "}
                      {previewData.filter((p) => !p.isValid).length} with errors)
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleSelectAll(selectedRows.length !== previewData.filter((p) => p.isValid).length)
                      }
                    >
                      {selectedRows.length === previewData.filter((p) => p.isValid).length
                        ? "Deselect All"
                        : "Select All Valid"}
                    </Button>
                    <Button onClick={importSelectedTransactions} disabled={selectedRows.length === 0 || isProcessing}>
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Import Selected ({selectedRows.length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedRows.length === previewData.filter((p) => p.isValid).length &&
                              previewData.filter((p) => p.isValid).length > 0
                            }
                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                          />
                        </TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.slice(0, 50).map((transaction) => (
                        <TableRow key={transaction.row} className={!transaction.isValid ? "bg-red-50" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.includes(transaction.row)}
                              onCheckedChange={(checked) => handleRowSelection(transaction.row, !!checked)}
                              disabled={!transaction.isValid}
                            />
                          </TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                          <TableCell className="text-right font-mono">${transaction.amount.toFixed(2)}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{transaction.account}</TableCell>
                          <TableCell>
                            {transaction.isValid ? (
                              <Badge variant="default">Valid</Badge>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Badge variant="destructive">Error</Badge>
                                <div className="text-xs text-red-600">{transaction.errors.join(", ")}</div>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {previewData.length > 50 && (
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    Showing first 50 rows of {previewData.length} total rows
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Column Mapping</CardTitle>
              <CardDescription>Map your file columns to transaction fields for accurate import</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="date-column">Date Column</Label>
                  <Select
                    value={mappingConfig.dateColumn}
                    onValueChange={(value) => setMappingConfig((prev) => ({ ...prev, dateColumn: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="transaction_date">Transaction Date</SelectItem>
                      <SelectItem value="posted_date">Posted Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description-column">Description Column</Label>
                  <Select
                    value={mappingConfig.descriptionColumn}
                    onValueChange={(value) => setMappingConfig((prev) => ({ ...prev, descriptionColumn: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select description column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="description">Description</SelectItem>
                      <SelectItem value="memo">Memo</SelectItem>
                      <SelectItem value="payee">Payee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="amount-column">Amount Column</Label>
                  <Select
                    value={mappingConfig.amountColumn}
                    onValueChange={(value) => setMappingConfig((prev) => ({ ...prev, amountColumn: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select amount column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category-column">Category Column (Optional)</Label>
                  <Select
                    value={mappingConfig.categoryColumn}
                    onValueChange={(value) => setMappingConfig((prev) => ({ ...prev, categoryColumn: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="type">Type</SelectItem>
                      <SelectItem value="classification">Classification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>Column Mapping Tips</AlertTitle>
                <AlertDescription>
                  Proper column mapping ensures accurate data import. Date and Amount columns are required, while
                  Category and Account are optional but recommended for better organization.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
