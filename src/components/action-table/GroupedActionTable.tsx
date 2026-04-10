'use client'

import { useState } from 'react'
import { Action } from '@/lib/types'
import { STAGE_COLORS, STAGE_DOT_COLORS, STAGE_HEADER_BG, STAGES } from '@/lib/constants'
import { ActionRow, ActionCard } from './ActionRow'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { ChevronDown, ChevronRight, CheckCheck, ArchiveRestore } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupedActionTableProps {
  actions: Action[]
  onUpdate: (id: string, updates: Partial<Action>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  showArchived?: boolean
}

const COLS = 7

export function GroupedActionTable({ actions, onUpdate, onDelete, showArchived = false }: GroupedActionTableProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const handleDone = (id: string, currentStatus: boolean) => {
    onUpdate(id, { status: !currentStatus })
  }

  const handleMarkAllDone = (e: React.MouseEvent, items: Action[]) => {
    e.stopPropagation()
    const allDone = items.every(a => a.status)
    items.forEach(a => onUpdate(a.id, { status: !allDone }))
  }

  const handleRestoreAll = (e: React.MouseEvent, items: Action[]) => {
    e.stopPropagation()
    items.forEach(a => onUpdate(a.id, { status: false, archived: false }))
  }

  const toggleCollapse = (stage: string) =>
    setCollapsed(prev => { const s = new Set(prev); s.has(stage) ? s.delete(stage) : s.add(stage); return s })

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

  const rowProps = (action: Action) => ({
    action,
    onUpdate,
    onDelete,
    showArchived,
    isFading: false,
    onDone: () => handleDone(action.id, action.status),
  })

  return (
    <div className="rounded-md border border-slate-200 overflow-visible">

      {/* ── Mobile: card layout (hidden on md+) ───────────────── */}
      <div className="md:hidden divide-y divide-slate-100">
        {groups.map(({ stage, items }) => {
          const isCollapsed = collapsed.has(stage)
          const doneCount = items.filter(a => a.status).length
          return (
            <div key={stage}>
              {/* Section header */}
              <button
                type="button"
                onClick={() => toggleCollapse(stage)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 text-left border-b',
                  STAGE_HEADER_BG[stage] || 'bg-slate-100 border-slate-200'
                )}
              >
                {isCollapsed
                  ? <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  : <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                }
                <span className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border',
                  STAGE_COLORS[stage] || 'bg-slate-100 text-slate-700 border-slate-200'
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', STAGE_DOT_COLORS[stage] || 'bg-slate-400')} />
                  {stage}
                </span>
                <span className="text-xs text-slate-500 ml-auto">
                  {items.length} action{items.length !== 1 ? 's' : ''}
                  {doneCount > 0 && ` · ${doneCount} done`}
                </span>
                {!showArchived ? (
                  <button
                    type="button"
                    onClick={e => handleMarkAllDone(e, items)}
                    title={items.every(a => a.status) ? 'Unmark all' : 'Mark all as done'}
                    className={cn(
                      'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors shrink-0',
                      items.every(a => a.status)
                        ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                        : 'bg-white/60 text-slate-500 border-slate-300 hover:bg-white hover:text-green-700'
                    )}
                  >
                    <CheckCheck className="h-3 w-3" />
                    <span className="hidden sm:inline">{items.every(a => a.status) ? 'Unmark all' : 'All done'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={e => handleRestoreAll(e, items)}
                    title="Restore all to Active"
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors shrink-0 bg-white/60 text-amber-600 border-amber-300 hover:bg-amber-50"
                  >
                    <ArchiveRestore className="h-3 w-3" />
                    <span className="hidden sm:inline">Restore all</span>
                  </button>
                )}
              </button>

              {/* Cards */}
              {!isCollapsed && items.map(action => (
                <ActionCard key={action.id} {...rowProps(action)} />
              ))}
            </div>
          )
        })}
      </div>

      {/* ── Desktop: table layout (hidden below md) ───────────── */}
      <div className="hidden md:block">
        <Table>
          <TableHeader className="sticky top-16 z-10 bg-slate-50 shadow-sm">
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[90px] font-semibold text-slate-700">Task ID</TableHead>
              <TableHead className="w-[130px] font-semibold text-slate-700">Domain</TableHead>
              <TableHead className="font-semibold text-slate-700">Action Plan</TableHead>
              <TableHead className="w-[120px] font-semibold text-slate-700">Owner</TableHead>
              <TableHead className="w-[220px] font-semibold text-slate-700">Metric</TableHead>
              <TableHead className="w-[70px] text-center font-semibold text-slate-700">Done</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>

          {groups.map(({ stage, items }) => {
            const isCollapsed = collapsed.has(stage)
            const doneCount = items.filter(a => a.status).length
            return (
              <TableBody key={stage}>
                <TableRow
                  className={cn(
                    'cursor-pointer select-none border-t',
                    STAGE_HEADER_BG[stage] || 'bg-slate-100 border-slate-200',
                    'hover:brightness-95'
                  )}
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
                      {!showArchived ? (
                        <button
                          type="button"
                          onClick={e => handleMarkAllDone(e, items)}
                          title={items.every(a => a.status) ? 'Unmark all' : 'Mark all as done'}
                          className={cn(
                            'ml-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors',
                            items.every(a => a.status)
                              ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                              : 'bg-white/60 text-slate-500 border-slate-300 hover:bg-white hover:text-green-700'
                          )}
                        >
                          <CheckCheck className="h-3 w-3" />
                          {items.every(a => a.status) ? 'Unmark all' : 'All done'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={e => handleRestoreAll(e, items)}
                          title="Restore all to Active"
                          className="ml-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors bg-white/60 text-amber-600 border-amber-300 hover:bg-amber-50"
                        >
                          <ArchiveRestore className="h-3 w-3" />
                          Restore all
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                {!isCollapsed && items.map(action => (
                  <ActionRow key={action.id} {...rowProps(action)} />
                ))}
              </TableBody>
            )
          })}
        </Table>
      </div>
    </div>
  )
}
