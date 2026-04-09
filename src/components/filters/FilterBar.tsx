'use client'

import { useState, useRef, useEffect } from 'react'
import * as Portal from '@radix-ui/react-portal'
import { FilterState, Action } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, ChevronDown, Check } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  actions: Action[]
}

// Owner filter: free-text input + dropdown with existing owners
function OwnerFilter({
  value,
  owners,
  onChange,
}: {
  value: string
  owners: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(value === 'all' ? '' : value)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value === 'all') setText('')
  }, [value])

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

  const apply = (v: string) => {
    setText(v === 'all' ? '' : v)
    onChange(v || 'all')
    setOpen(false)
  }

  const handleFocus = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      setCoords({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width })
    }
    setOpen(true)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    onChange(e.target.value || 'all')
    setOpen(true)
  }

  return (
    <div ref={wrapperRef} className="relative w-[150px]">
      <div className="relative">
        <Input
          placeholder="Owner..."
          value={text}
          onChange={handleInput}
          onFocus={handleFocus}
          onKeyDown={e => { if (e.key === 'Escape' || e.key === 'Enter') setOpen(false) }}
          className="h-9 pr-7 text-sm"
        />
        <button
          type="button"
          onClick={() => {
            handleFocus()
            setOpen(o => !o)
          }}
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
            className="bg-white border border-slate-200 rounded-md shadow-lg py-1 max-h-48 overflow-y-auto"
          >
            <button type="button" onClick={() => apply('all')}
              className={cn('flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-slate-50 text-slate-500', value === 'all' && 'font-semibold text-slate-700')}>
              All Owners
            </button>
            {filtered.map(o => (
              <button key={o} type="button" onClick={() => apply(o)}
                className={cn('flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-slate-50', value === o && 'bg-slate-50 font-semibold')}>
                {o}
                {value === o && <Check className="h-3.5 w-3.5 text-blue-500" />}
              </button>
            ))}
            {text && !owners.includes(text) && (
              <button type="button" onClick={() => apply(text)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-slate-50 text-blue-600 border-t border-slate-100">
                <Search className="h-3 w-3" />
                Search "{text}"
              </button>
            )}
          </div>
        </Portal.Root>
      )}
    </div>
  )
}

export function FilterBar({ filters, onFiltersChange, actions }: FilterBarProps) {
  const owners = Array.from(new Set(actions.map(a => a.owner))).filter(Boolean).sort()
  const quarters = Array.from(new Set(
    actions.flatMap(a => a.impact_quarter ? a.impact_quarter.split(',').map(q => q.trim()) : [])
  )).filter(Boolean).sort()
  const stages = Array.from(new Set(actions.map(a => a.stage))).filter(Boolean).sort()

  const update = (key: keyof FilterState, value: string) =>
    onFiltersChange({ ...filters, [key]: value })

  const hasActiveFilters = filters.owner !== 'all' || filters.quarter !== 'all' ||
    filters.stage !== 'all' || filters.status !== 'all' || filters.search !== ''

  const clearAll = () =>
    onFiltersChange({ owner: 'all', quarter: 'all', stage: 'all', status: 'all', search: '' })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search actions..."
          value={filters.search}
          onChange={e => update('search', e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      <Select value={filters.stage} onValueChange={v => update('stage', v)}>
        <SelectTrigger className="w-[155px] h-9">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <OwnerFilter
        value={filters.owner}
        owners={owners}
        onChange={v => update('owner', v)}
      />

      <Select value={filters.quarter} onValueChange={v => update('quarter', v)}>
        <SelectTrigger className="w-[125px] h-9">
          <SelectValue placeholder="Quarter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Quarters</SelectItem>
          {quarters.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={v => update('status', v)}>
        <SelectTrigger className="w-[125px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-9 px-3 text-slate-500">
          <X className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
