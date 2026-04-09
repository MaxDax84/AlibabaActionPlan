'use client'

import { useState, useRef, useEffect } from 'react'
import { QUARTERS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Helpers
export function parseQuarters(value: string): string[] {
  return value ? value.split(',').map(q => q.trim()).filter(Boolean) : []
}

export function serializeQuarters(quarters: string[]): string {
  return quarters.join(',')
}

interface QuarterMultiSelectProps {
  value: string          // comma-separated, e.g. "Q1,Q3"
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inline?: boolean       // compact style for table cell
}

export function QuarterMultiSelect({
  value,
  onChange,
  placeholder = '—',
  className,
  inline = false,
}: QuarterMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = parseQuarters(value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (q: string) => {
    const next = selected.includes(q)
      ? selected.filter(x => x !== q)
      : [...selected, q].sort()
    onChange(serializeQuarters(next))
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-1 rounded transition-colors',
          inline
            ? 'h-7 px-2 text-xs border border-transparent hover:border-slate-200 w-full min-w-[76px]'
            : 'h-9 px-3 text-sm border border-slate-200 hover:border-slate-300 w-full bg-white rounded-md shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-400'
        )}
      >
        <span className="flex-1 flex flex-wrap gap-1 items-center min-h-[1.25rem]">
          {selected.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : (
            selected.map(q => (
              <Badge key={q} variant="secondary" className="text-xs px-1.5 py-0">
                {q}
              </Badge>
            ))
          )}
        </span>
        <ChevronDown className={cn('h-3 w-3 text-slate-400 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-white border border-slate-200 rounded-md shadow-lg py-1 min-w-[90px]">
          {QUARTERS.map(q => {
            const checked = selected.includes(q)
            return (
              <button
                key={q}
                type="button"
                onClick={() => toggle(q)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-slate-50 transition-colors"
              >
                <span className={cn(
                  'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                  checked ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                )}>
                  {checked && <Check className="h-2.5 w-2.5 text-white" />}
                </span>
                <span className={cn('font-medium', checked ? 'text-slate-900' : 'text-slate-600')}>
                  {q}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
