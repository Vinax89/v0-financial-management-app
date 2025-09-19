'use client'
import * as React from 'react'

export type Filters = {
  month?: string
  from?: string
  to?: string
  q?: string
  categoryIds?: string[]
  amountMin?: string
  amountMax?: string
  amountMode?: 'signed' | 'absolute'
}

export default function FilterBar({ init, categories }: { init?: Filters; categories?: { id: string; name: string }[] }) {
  const [state, setState] = React.useState<Filters>(init || {})

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setState((s) => ({ ...s, [name]: value || undefined }))
  }

  const onMulti = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opts = Array.from(e.target.selectedOptions).map(o => o.value)
    setState((s) => ({ ...s, categoryIds: opts.length ? opts : undefined }))
  }

  return (
    <form className="flex flex-wrap gap-2 items-end" action="" method="get">
      <div className="flex flex-col">
        <label className="text-xs">Month</label>
        <input type="month" name="month" defaultValue={state.month} onChange={onChange} className="border rounded p-2" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs">From</label>
        <input type="date" name="from" defaultValue={state.from} onChange={onChange} className="border rounded p-2" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs">To</label>
        <input type="date" name="to" defaultValue={state.to} onChange={onChange} className="border rounded p-2" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs">Search</label>
        <input type="text" name="q" placeholder="Merchant or memo" defaultValue={state.q} onChange={onChange} className="border rounded p-2" />
      </div>
      {categories && (
        <div className="flex flex-col">
          <label className="text-xs">Categories</label>
          <select name="categoryIds" multiple defaultValue={state.categoryIds} onChange={onMulti} className="border rounded p-2 min-w-[12rem] h-28">
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
      )}
      <div className="flex flex-col">
        <label className="text-xs">Amount ≥</label>
        <input type="number" step="0.01" inputMode="decimal" name="amountMin" defaultValue={state.amountMin} onChange={onChange} className="border rounded p-2 w-28" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs">Amount ≤</label>
        <input type="number" step="0.01" inputMode="decimal" name="amountMax" defaultValue={state.amountMax} onChange={onChange} className="border rounded p-2 w-28" />
      </div>
      <div className="flex flex-col">
        <label className="text-xs">Mode</label>
        <select name="amountMode" defaultValue={state.amountMode || 'signed'} onChange={onChange} className="border rounded p-2">
          <option value="signed">Signed</option>
          <option value="absolute">Absolute</option>
        </select>
      </div>
      <button className="px-3 py-2 border rounded">Apply</button>
    </form>
  )
}
