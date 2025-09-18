"use client"

import type React from "react"

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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

interface ImportTransactionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportTransactionsDialog({ open, onOpenChange }: ImportTransactionsDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAccount, setSelectedAccount] = useState("")
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    total: number
    imported: number
    duplicates: number
    errors: number
  } | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleImport = async () => {
    if (!selectedFile || !selectedAccount) return

    setIsImporting(true)
    setImportProgress(0)

    // Simulate import process
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsImporting(false)
          setImportResults({
            total: 150,
            imported: 142,
            duplicates: 5,
            errors: 3,
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setSelectedAccount("")
    setImportProgress(0)
    setIsImporting(false)
    setImportResults(null)
  }

  const handleClose = () => {
    handleReset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Import Transactions</DialogTitle>
          <DialogDescription>
            Upload CSV, OFX, or QFX files to import your transaction history with automatic deduplication
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!importResults ? (
            <>
              {/* File Upload */}
              <div className="space-y-4">
                <Label htmlFor="file-upload">Select File</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.ofx,.qfx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground">CSV, OFX, or QFX files up to 10MB</p>
                      </div>
                    </div>
                  </label>
                </div>

                {selectedFile && (
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Account Selection */}
              <div className="space-y-2">
                <Label htmlFor="account">Target Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account to import to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="investment">Investment Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Import Progress */}
              {isImporting && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Importing Transactions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={importProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Processing transactions and checking for duplicates...
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Supported Formats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Supported Formats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>CSV:</strong> Date, Description, Amount, Category (optional)
                    </p>
                    <p>
                      <strong>OFX/QFX:</strong> Standard banking format from most financial institutions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Import Results */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Import Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{importResults.imported}</div>
                    <div className="text-sm text-muted-foreground">Imported</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{importResults.total}</div>
                    <div className="text-sm text-muted-foreground">Total Found</div>
                  </div>
                </div>

                {(importResults.duplicates > 0 || importResults.errors > 0) && (
                  <div className="space-y-2">
                    {importResults.duplicates > 0 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-600">
                        <AlertCircle className="w-4 h-4" />
                        {importResults.duplicates} duplicates skipped
                      </div>
                    )}
                    {importResults.errors > 0 && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        {importResults.errors} transactions had errors
                      </div>
                    )}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  Transactions have been automatically categorized using machine learning. Review and adjust categories
                  as needed.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {importResults ? "Close" : "Cancel"}
          </Button>
          {!importResults && (
            <Button
              onClick={handleImport}
              disabled={!selectedFile || !selectedAccount || isImporting}
              className="min-w-24"
            >
              {isImporting ? "Importing..." : "Import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
