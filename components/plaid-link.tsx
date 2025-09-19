"use client"

import React from "react"

import { useState, useCallback, useEffect, useMemo } from "react"
import { usePlaidLink } from "react-plaid-link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, AlertCircle, CheckCircle, Building2, CreditCard, Trash2 } from "lucide-react"

interface PlaidLinkProps {
  userId: string
  onSuccess?: (itemId: string) => void
  onError?: (error: any) => void
}

interface ConnectedAccount {
  id: string
  itemId: string
  institutionName: string
  accounts: {
    id: string
    name: string
    type: string
    subtype: string
    mask: string
    balance: number
  }[]
  status: string
  lastSync: Date
}

const AccountItem = React.memo(({ account }: { account: ConnectedAccount["accounts"][0] }) => (
  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
    <div className="flex items-center gap-2">
      <CreditCard className="w-4 h-4 text-muted-foreground" />
      <div>
        <div className="font-medium text-sm">{account.name}</div>
        <div className="text-xs text-muted-foreground">
          {account.type} • ****{account.mask}
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="font-medium text-sm">${account.balance.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground">{account.subtype}</div>
    </div>
  </div>
))

AccountItem.displayName = "AccountItem"

const ConnectionItem = React.memo(
  ({
    connection,
    onSync,
    onDisconnect,
  }: {
    connection: ConnectedAccount
    onSync: (itemId: string) => void
    onDisconnect: (itemId: string) => void
  }) => {
    const getStatusColor = useCallback((status: string) => {
      switch (status) {
        case "active":
          return "default"
        case "error":
          return "destructive"
        case "requires_update":
          return "secondary"
        default:
          return "outline"
      }
    }, [])

    const getStatusIcon = useCallback((status: string) => {
      switch (status) {
        case "active":
          return <CheckCircle className="w-4 h-4 text-green-500" />
        case "error":
          return <AlertCircle className="w-4 h-4 text-red-500" />
        case "requires_update":
          return <AlertCircle className="w-4 h-4 text-yellow-500" />
        default:
          return <Building2 className="w-4 h-4 text-gray-500" />
      }
    }, [])

    const accountItems = useMemo(
      () => connection.accounts.map((account) => <AccountItem key={account.id} account={account} />),
      [connection.accounts],
    )

    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(connection.status)}
            <div>
              <h4 className="font-medium">{connection.institutionName}</h4>
              <p className="text-sm text-muted-foreground">Last synced: {connection.lastSync.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(connection.status)}>{connection.status}</Badge>
            <Button variant="outline" size="sm" onClick={() => onSync(connection.itemId)}>
              Sync
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDisconnect(connection.itemId)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">{accountItems}</div>
      </div>
    )
  },
)

ConnectionItem.displayName = "ConnectionItem"

export function PlaidLink({ userId, onSuccess, onError }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])

  const loadConnectedAccounts = useCallback(async () => {
    try {
      const response = await fetch(`/api/plaid/accounts?userId=${userId}`)
      if (!response.ok) throw new Error("Failed to load accounts")

      const data = await response.json()
      setConnectedAccounts(data.accounts || [])
    } catch (error) {
      console.error("Failed to load connected accounts:", error)
    }
  }, [userId])

  useEffect(() => {
    loadConnectedAccounts()
  }, [loadConnectedAccounts])

  const createLinkToken = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error("Failed to create link token")
      }

      const data = await response.json()
      setLinkToken(data.linkToken)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create link token"
      setError(errorMessage)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [userId, onError])

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicToken, userId }),
        })

        if (!response.ok) {
          throw new Error("Failed to connect bank account")
        }

        const data = await response.json()

        // Reload connected accounts
        await loadConnectedAccounts()

        onSuccess?.(data.itemId)
        setLinkToken(null) // Reset link token
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to connect bank account"
        setError(errorMessage)
        onError?.(error)
      } finally {
        setIsLoading(false)
      }
    },
    [userId, onSuccess, onError, loadConnectedAccounts],
  )

  const onPlaidError = useCallback(
    (error: any) => {
      console.error("Plaid Link error:", error)
      setError(error.error_message || "Failed to connect bank account")
      onError?.(error)
    },
    [onError],
  )

  const onPlaidExit = useCallback((error: any, metadata: any) => {
    if (error) {
      console.error("Plaid Link exit error:", error)
      setError(error.error_message || "Connection cancelled")
    }
    setLinkToken(null) // Reset link token
  }, [])

  // Initialize Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onError: onPlaidError,
    onExit: onPlaidExit,
  })

  const disconnectAccount = useCallback(
    async (itemId: string) => {
      if (!confirm("Are you sure you want to disconnect this bank account?")) return

      try {
        const response = await fetch("/api/plaid/remove-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, userId }),
        })

        if (!response.ok) throw new Error("Failed to disconnect account")

        // Reload connected accounts
        await loadConnectedAccounts()
      } catch (error) {
        console.error("Failed to disconnect account:", error)
        setError("Failed to disconnect account")
      }
    },
    [userId, loadConnectedAccounts],
  )

  const syncAccount = useCallback(
    async (itemId: string) => {
      try {
        const response = await fetch("/api/plaid/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, userId }),
        })

        if (!response.ok) throw new Error("Failed to sync account")

        // Reload connected accounts
        await loadConnectedAccounts()
      } catch (error) {
        console.error("Failed to sync account:", error)
        setError("Failed to sync account")
      }
    },
    [userId, loadConnectedAccounts],
  )

  const connectionList = useMemo(
    () =>
      connectedAccounts.map((connection) => (
        <ConnectionItem
          key={connection.id}
          connection={connection}
          onSync={syncAccount}
          onDisconnect={disconnectAccount}
        />
      )),
    [connectedAccounts, syncAccount, disconnectAccount],
  )

  return (
    <div className="space-y-6">
      {/* Add New Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Connect Bank Account
          </CardTitle>
          <CardDescription>Securely connect your bank accounts to automatically import transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {!linkToken ? (
              <Button onClick={createLinkToken} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Connect Bank Account
              </Button>
            ) : (
              <Button onClick={() => open()} disabled={!ready || isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Building2 className="w-4 h-4 mr-2" />}
                Continue with Bank Selection
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Your data is encrypted and secure. We use bank-level security and never store your login credentials.</p>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>Manage your connected bank accounts and sync status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">{connectionList}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
