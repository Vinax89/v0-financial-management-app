import { NextResponse } from 'next/server'
import { setActiveWorkspace } from '@/lib/workspace'

export async function POST(req: Request) {
  const { workspaceId } = await req.json()
  const ok = await setActiveWorkspace(workspaceId)
  return NextResponse.json({ ok })
}
