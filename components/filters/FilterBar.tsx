'use client'
import * as React from 'react'

export type Filters = {
  month?: string
  from?: string
  to?: string
  q?: string
  categoryId?: string
}

export default function FilterBar({ init, categories }: { init?: Filters; categories?: { id: string; name: string }[] }) {
  const [state, setState] = React.useState<Filters>(init || {})
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setState((s) => ({ ...s, [name]: value || undefined }))
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
      {categories && categories.length > 0 && (
        <div className="flex flex-col">
          <label className="text-xs">Category</label>
          <select name="categoryId" defaultValue={state.categoryId} onChange={onChange} className="border rounded p-2">
            <option value="">All</option>
            {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
      )}
      <button className="px-3 py-2 border rounded">Apply</button>
    </form>
  )
}
