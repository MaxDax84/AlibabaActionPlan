'use client'

import { useState } from 'react'
import { Action } from '@/lib/types'
import { ActionRow, FADE_DURATION } from './ActionRow'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ActionTableProps {
  actions: Action[]
  onUpdate: (id: string, updates: Partial<Action>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  showArchived?: boolean
  showStageColumn?: boolean
}

export function ActionTable({ actions, onUpdate, onDelete, showArchived = false, showStageColumn = true }: ActionTableProps) {
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set())

  const handleDone = (id: string) => {
    setFadingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      onUpdate(id, { status: true, archived: true })
      setFadingIds(prev => { const s = new Set(prev); s.delete(id); return s })
    }, FADE_DURATION)
  }

  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-lg font-medium">No actions found</p>
        <p className="text-sm mt-1">{showArchived ? 'No archived actions yet.' : 'Add a new action to get started.'}</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-slate-200">
      <Table>
        <TableHeader className="sticky top-16 z-10 bg-slate-50 shadow-sm">
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            {showStageColumn && <TableHead className="w-[170px] font-semibold text-slate-700">Stage</TableHead>}
            <TableHead className="font-semibold text-slate-700">Action</TableHead>
            <TableHead className="w-[120px] font-semibold text-slate-700">Owner</TableHead>
            <TableHead className="font-semibold text-slate-700">Quarter</TableHead>
            <TableHead className="w-[220px] font-semibold text-slate-700">KPI</TableHead>
            <TableHead className="w-[70px] text-center font-semibold text-slate-700">Done</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map(action => (
            <ActionRow
              key={action.id}
              action={action}
              onUpdate={onUpdate}
              onDelete={onDelete}
              showArchived={showArchived}
              showStageColumn={showStageColumn}
              isFading={fadingIds.has(action.id)}
              onDone={() => handleDone(action.id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
