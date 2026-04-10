'use client'

import { useState, useRef, useEffect } from 'react'
import * as Portal from '@radix-ui/react-portal'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FilterState, Action } from '@/lib/types'
import { STAGES } from '@/lib/constants'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  actions: Action[]
}

// ── Generic multi-select dropdown ─────────────────────────────

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  className,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  className?: string
}) {
  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  }

  const displayLabel = selected.length === 0
    ? `All ${label}s`
    : selected.length === 1
      ? selected[0]
      : `${selected.length} ${label}s`

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center justify-between gap-1.5 h-9 px-3 rounded-md border border-input bg-background text-sm',
            'hover:bg-accent hover:text-accent-foreground transition-colors',
            selected.length > 0 && 'border-blue-400 bg-blue-50 text-blue-700',
            className
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-1 w-56" align="start" avoidCollisions>
        <button
          type="button"
          onClick={() => onChange([])}
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 text-sm rounded hover:bg-slate-50',
            selected.length === 0 && 'font-semibold text-slate-700'
          )}
        >
          All {label}s
          {selected.length === 0 && <Check className="h-3.5 w-3.5 text-blue-500" />}
        </button>
        <div className="border-t border-slate-100 mt-1 pt-1">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm rounded hover:bg-slate-50 text-left"
            >
              <span className="truncate">{opt}</span>
              {selected.includes(opt) && <Check className="h-3.5 w-3.5 text-blue-500 shrink-0 ml-2" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ── Owner filter: free-text + dropdown ────────────────────────

function OwnerFilter({
  selected,
  owners,
  onChange,
}: {
  selected: string[]
  owners: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const portal = document.getElementById('owner-filter-portal')
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target as Node) &&
        !(portal && portal.contains(e.target as Node))
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = owners.filter(o => o.toLowerCase().includes(text.toLowerCase()))

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  }

  const handleFocus = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      const DROPDOWN_H = 220
      const spaceBelow = window.innerHeight - rect.bottom
      const top = spaceBelow >= DROPDOWN_H
        ? rect.bottom + window.scrollY + 4
        : rect.top + window.scrollY - DROPDOWN_H - 4
      setCoords({ top, left: rect.left + window.scrollX, width: Math.max(rect.width, 180) })
    }
    setOpen(true)
  }

  const displayLabel = selected.length === 0
    ? ''
    : selected.length === 1 ? selected[0] : `${selected.length} owners`

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-[120px]">
      <div className={cn(
        'relative flex items-center rounded-md border border-input bg-background',
        selected.length > 0 && 'border-blue-400 bg-blue-50'
      )}>
        <Input
          placeholder="Owner..."
          value={text || displayLabel}
          onChange={e => { setText(e.target.value); setOpen(true) }}
          onFocus={handleFocus}
          onKeyDown={e => { if (e.key === 'Escape' || e.key === 'Enter') setOpen(false) }}
          className={cn('h-9 pr-7 border-0 bg-transparent focus-visible:ring-0 text-sm',
            selected.length > 0 && 'text-blue-700')}
        />
        <button
          type="button"
          onClick={() => { handleFocus(); setOpen(o => !o) }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        </button>
      </div>

      {open && (
        <Portal.Root>
          <div
            id="owner-filter-portal"
            style={{ position: 'absolute', top: coords.top, left: coords.left, width: coords.width, zIndex: 9999 }}
            className="bg-white border border-slate-200 rounded-md shadow-lg py-1 max-h-52 overflow-y-auto"
          >
            <button type="button" onClick={() => { onChange([]); setText(''); setOpen(false) }}
              className={cn('flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-slate-50 text-slate-500',
                selected.length === 0 && 'font-semibold text-slate-700')}>
              All Owners
              {selected.length === 0 && <Check className="h-3.5 w-3.5 text-blue-500" />}
            </button>
            <div className="border-t border-slate-100 mt-1 pt-1">
              {filtered.map(o => (
                <button key={o} type="button" onClick={() => toggle(o)}
                  className="flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-slate-50">
                  {o}
                  {selected.includes(o) && <Check className="h-3.5 w-3.5 text-blue-500" />}
                </button>
              ))}
            </div>
          </div>
        </Portal.Root>
      )}
    </div>
  )
}

// ── FilterBar ─────────────────────────────────────────────────

export function FilterBar({ filters, onFiltersChange, actions }: FilterBarProps) {
  const owners = Array.from(new Set(actions.map(a => a.owner))).filter(Boolean).sort()
  const domains = Array.from(new Set(actions.map(a => a.domain))).filter(Boolean).sort()
  // Sections in defined order, only those present in current tab
  const stages = STAGES.filter(s => actions.some(a => a.stage === s))

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onFiltersChange({ ...filters, [key]: value })

  const hasActiveFilters =
    filters.owner.length > 0 || filters.domain.length > 0 ||
    filters.stage.length > 0 || filters.search !== ''

  const clearAll = () =>
    onFiltersChange({ owner: [], domain: [], stage: [], status: 'all', search: '' })

  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: search */}
      <div className="relative w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search actions..."
          value={filters.search}
          onChange={e => update('search', e.target.value)}
          className="pl-8 h-9 w-full"
        />
      </div>

      {/* Row 2: filters */}
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelect
          label="Section"
          options={stages}
          selected={filters.stage}
          onChange={v => update('stage', v)}
          className="flex-1 min-w-[140px]"
        />

        <MultiSelect
          label="Domain"
          options={domains}
          selected={filters.domain}
          onChange={v => update('domain', v)}
          className="flex-1 min-w-[120px]"
        />

        <OwnerFilter
          selected={filters.owner}
          owners={owners}
          onChange={v => update('owner', v)}
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-9 px-3 text-slate-500 shrink-0">
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
