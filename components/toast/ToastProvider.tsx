'use client'
import * as React from 'react'
import './theme.css'

type Toast = { id: number; title: string; kind?: 'success'|'error'|'info' }

const Ctx = React.createContext<{ push: (t: Omit<Toast,'id'>) => void }|null>(null)

export function useToast() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error('ToastProvider missing')
  return {
    success: (title: string) => ctx.push({ title, kind: 'success' }),
    error: (title: string) => ctx.push({ title, kind: 'error' }),
    info: (title: string) => ctx.push({ title, kind: 'info' }),
  }
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const push = (t: Omit<Toast,'id'>) => {
    const id = Date.now()+Math.random()
    setToasts(s => [...s, { id, ...t }]); setTimeout(()=> setToasts(s => s.filter(x=>x.id!==id)), 4000)
  }
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className="px-3 py-2 rounded shadow border text-sm" style={{
            background: 'var(--toast-bg)', color: 'var(--toast-fg)', borderColor: 'var(--toast-border)'
          }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: 9999,
              background: t.kind==='success'?'var(--toast-success)': t.kind==='error'?'var(--toast-error)':'var(--toast-info)',
              marginRight: 8
            }} />
            {t.title}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
