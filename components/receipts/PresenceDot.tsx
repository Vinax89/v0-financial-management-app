// components/receipts/PresenceDot.tsx
'use client'
import * as React from 'react'
import { usePresence } from '@/lib/realtime/usePresence'

export default function PresenceDot({ id }: { id: string }) {
  const peers = usePresence(`presence:receipts:${id}`, null as any) // read-only room
  const active = Object.keys(peers).length > 0
  return <span className={`inline-block w-2 h-2 rounded-full ${active? 'bg-emerald-500':'bg-transparent'}`} title={active? 'Someone is editing':''} />
}
