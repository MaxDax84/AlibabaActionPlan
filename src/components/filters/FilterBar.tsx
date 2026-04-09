'use client'

import { FilterState } from '@/lib/types'
import { Action } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterBarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  actions: Action[]
}

export function FilterBar({ filters, onFiltersChange, actions }: FilterBarProps) {
  const owners = Array.from(new Set(actions.map(a => a.owner))).filter(Boolean).sort()
  const quarters = Array.from(new Set(actions.map(a => a.impact_quarter))).filter(Boolean).sort()
  const stages = Array.from(new Set(actions.map(a => a.stage))).filter(Boolean).sort()

  const update = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = filters.owner !== 'all' || filters.quarter !== 'all' ||
    filters.stage !== 'all' || filters.status !== 'all' || filters.search !== ''

  const clearAll = () => {
    onFiltersChange({ owner: 'all', quarter: 'all', stage: 'all', status: 'all', search: '' })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search actions..."
          value={filters.search}
          onChange={e => update('search', e.target.value)}
          className="pl-8 h-9"
        />
      </div>

      <Select value={filters.stage} onValueChange={v => update('stage', v)}>
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {stages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.owner} onValueChange={v => update('owner', v)}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Owner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Owners</SelectItem>
          {owners.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.quarter} onValueChange={v => update('quarter', v)}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Quarter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Quarters</SelectItem>
          {quarters.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={v => update('status', v)}>
        <SelectTrigger className="w-[130px] h-9">
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
