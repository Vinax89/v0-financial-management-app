// lib/realtime/usePresence.ts
'use client'
import * as React from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type PresenceUser = { id: string; name: string; email: string }

type PresenceState = Record<string, PresenceUser>

export function usePresence(room: string, me: PresenceUser | null) {
  const [peers, setPeers] = React.useState<PresenceState>({})
  React.useEffect(() => {
    if (!me) return
    const sb = getSupabaseBrowserClient()
    const channel = sb.channel(room, { config: { presence: { key: me.id } } })

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as Record<string, { metas: PresenceUser[] }[]>
      const flat: PresenceState = {}
      for (const key of Object.keys(state)) {
        const metas = (state[key] || []) as any
        if (metas[0]?.metas?.[0]) flat[key] = metas[0].metas[0]
      }
      setPeers(flat)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(me)
      }
    })

    return () => { sb.removeChannel(channel) }
  }, [room, me?.id])

  return peers
}
