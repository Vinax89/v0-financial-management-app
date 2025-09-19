// components/receipts/ConfidenceHeatmap.tsx
'use client'
import * as React from 'react'

type Row = { confidence_score: number | null }

export default function ConfidenceHeatmap({ rows, onSelect, onClear }: { rows: Row[]; onSelect?: (min: number, max: number) => void; onClear?: () => void }) {
  const scores = rows.map(r => (typeof r.confidence_score === 'number' ? r.confidence_score : null)).filter((x): x is number => x !== null)
  const bins = new Array(10).fill(0)
  for (const s of scores) {
    const idx = Math.max(0, Math.min(9, Math.floor(s * 10)))
    bins[idx]++
  }
  const total = scores.length || 1
  return (
    <div className="w-full">
      <div className="text-sm mb-1">OCR Confidence Distribution</div>
      <div className="grid grid-cols-10 gap-1 items-end">
        {bins.map((b, i) => {
          const min = i/10, max = i===9 ? 1 : (i+1)/10
          return (
            <button key={i} className="flex flex-col items-center gap-1 group" onClick={()=>onSelect?.(min, max)} title={`Filter ${min*100}–${max*100}%`}>
              <div className="w-full bg-gradient-to-t from-red-200 via-amber-200 to-emerald-300 group-hover:opacity-80" style={{ height: `${Math.max(6, (b/total)*80)}px` }} />
              <div className="text-[10px] opacity-60">{i*10}–{i===9?100:(i+1)*10}%</div>
            </button>
          )
        })}
      </div>
      <div className="mt-1 text-right">
        <button className="text-[11px] underline" onClick={()=>onClear?.()}>Clear filter</button>
      </div>
    </div>
  )
}
