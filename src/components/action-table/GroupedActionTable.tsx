'use client'

import { useState } from 'react'
import { Action } from '@/lib/types'
import { STAGE_COLORS, STAGE_DOT_COLORS, STAGES } from '@/lib/constants'
import { ActionRow, FADE_DURATION } from './ActionRow'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupedActionTableProps {
  actions: Action[]
  onUpdate: (id: string, updates: Partial<Action>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  showArchived?: boolean
}

const COLS = 6 // Action + Owner + Quarter + KPI + Done + Delete

export function GroupedActionTable({ actions, onUpdate, onDelete, showArchived = false }: GroupedActionTableProps) {
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const handleDone = (id: string) => {
    setFadingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      onUpdate(id, { status: true, archived: true })
      setFadingIds(prev => { const s = new Set(prev); s.delete(id); return s })
    }, FADE_DURATION)
  }

  const toggleCollapse = (stage: string) =>
    setCollapsed(prev => { const s = new Set(prev); s.has(stage) ? s.delete(stage) : s.add(stage); return s })

  // Build ordered groups
  const knownStages = new Set(STAGES)
  const groups = [
    ...STAGES.map(stage => ({ stage, items: actions.filter(a => a.stage === stage) })).filter(g => g.items.length > 0),
    ...(() => {
      const other = actions.filter(a => !knownStages.has(a.stage))
      return other.length > 0 ? [{ stage: 'Other', items: other }] : []
    })(),
  ]

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-lg font-medium">No actions found</p>
        <p className="text-sm mt-1">{showArchived ? 'No archived actions yet.' : 'Add a new action to get started.'}</p>
      </div>
    )
  }

  return (
    // Single table — one header, all groups share column widths
    <div className="rounded-md border border-slate-200 overflow-visible">
      <Table>
        <TableHeader className="sticky top-16 z-10 bg-slate-50 shadow-sm">
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="font-semibold text-slate-700">Action</TableHead>
            <TableHead className="w-[120px] font-semibold text-slate-700">Owner</TableHead>
            <TableHead className="font-semibold text-slate-700">Quarter</TableHead>
            <TableHead className="w-[220px] font-semibold text-slate-700">KPI</TableHead>
            <TableHead className="w-[70px] text-center font-semibold text-slate-700">Done</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>

        {groups.map(({ stage, items }) => {
          const isCollapsed = collapsed.has(stage)
          const doneCount = items.filter(a => a.status).length

          return (
            <TableBody key={stage}>
              {/* Stage group header row */}
              <TableRow
                className="bg-slate-50/80 hover:bg-slate-100/60 cursor-pointer select-none border-t border-slate-200"
                onClick={() => toggleCollapse(stage)}
              >
                <TableCell colSpan={COLS} className="py-2 px-4">
                  <div className="flex items-center gap-2.5">
                    {isCollapsed
                      ? <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      : <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    }
                    <span className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border',
                      STAGE_COLORS[stage] || 'bg-slate-100 text-slate-700 border-slate-200'
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', STAGE_DOT_COLORS[stage] || 'bg-slate-400')} />
                      {stage}
                    </span>
                    <span className="text-xs text-slate-400">
                      {items.length} action{items.length !== 1 ? 's' : ''}
                      {doneCount > 0 && ` · ${doneCount} done`}
                    </span>
                  </div>
                </TableCell>
              </TableRow>

              {/* Action rows for this stage */}
              {!isCollapsed && items.map(action => (
                <ActionRow
                  key={action.id}
                  action={action}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  showArchived={showArchived}
                  showStageColumn={false}
                  isFading={fadingIds.has(action.id)}
                  onDone={() => handleDone(action.id)}
                />
              ))}
            </TableBody>
          )
        })}
      </Table>
    </div>
  )
}
