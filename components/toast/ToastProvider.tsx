'use client'
import * as React from 'react'

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
          <div key={t.id} className={`px-3 py-2 rounded shadow border text-sm bg-white ${t.kind==='success'?'border-emerald-300':t.kind==='error'?'border-red-300':'border-gray-300'}`}>
            {t.title}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
