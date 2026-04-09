'use client'

import { useState, useRef, useEffect } from 'react'
import * as Portal from '@radix-ui/react-portal'
import { QUARTERS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function parseQuarters(value: string): string[] {
  return value ? value.split(',').map(q => q.trim()).filter(Boolean) : []
}

export function serializeQuarters(quarters: string[]): string {
  return quarters.join(',')
}

interface QuarterMultiSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inline?: boolean
}

export function QuarterMultiSelect({
  value,
  onChange,
  placeholder = '—',
  className,
  inline = false,
}: QuarterMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const selected = parseQuarters(value)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        // Check if click is inside the portal dropdown
        const portal = document.getElementById('quarter-portal')
        if (portal && portal.contains(target)) return
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Recalculate position on open
  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 100),
      })
    }
    setOpen(o => !o)
  }

  const toggle = (q: string) => {
    const next = selected.includes(q)
      ? selected.filter(x => x !== q)
      : [...selected, q].sort()
    onChange(serializeQuarters(next))
  }

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          'flex items-center gap-1 rounded transition-colors w-full',
          inline
            ? 'h-7 px-2 text-xs border border-transparent hover:border-slate-200 min-w-[76px]'
            : 'h-9 px-3 text-sm border border-slate-200 hover:border-slate-300 bg-white rounded-md shadow-sm',
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
        <Portal.Root>
          <div
            id="quarter-portal"
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
              minWidth: coords.width,
              zIndex: 9999,
            }}
            className="bg-white border border-slate-200 rounded-md shadow-lg py-1"
          >
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
        </Portal.Root>
      )}
    </div>
  )
}
