'use client'

import { useState } from 'react'
import { Action } from '@/lib/types'
import { STAGE_COLORS, STAGE_DOT_COLORS, STAGES } from '@/lib/constants'
import { ActionTable } from './ActionTable'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupedActionTableProps {
  actions: Action[]
  onUpdate: (id: string, updates: Partial<Action>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  showArchived?: boolean
}

export function GroupedActionTable({ actions, onUpdate, onDelete, showArchived = false }: GroupedActionTableProps) {
  // Group actions by stage, preserving STAGES order
  const groups = STAGES
    .map(stage => ({
      stage,
      items: actions.filter(a => a.stage === stage),
    }))
    .filter(g => g.items.length > 0)

  // Also collect any actions with stages not in STAGES list
  const knownStages = new Set(STAGES)
  const otherItems = actions.filter(a => !knownStages.has(a.stage))
  if (otherItems.length > 0) {
    groups.push({ stage: 'Other', items: otherItems })
  }

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (stage: string) =>
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(stage) ? next.delete(stage) : next.add(stage)
      return next
    })

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-lg font-medium">No actions found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-1">
      {groups.map(({ stage, items }) => {
        const isCollapsed = collapsed.has(stage)
        const doneCount = items.filter(a => a.status).length
        return (
          <div key={stage} className="rounded-lg border border-slate-200 overflow-visible bg-white">
            {/* Section header */}
            <button
              type="button"
              onClick={() => toggle(stage)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors rounded-t-lg"
            >
              {isCollapsed
                ? <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
              }
              <span className={cn(
                'inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border',
                STAGE_COLORS[stage] || 'bg-slate-100 text-slate-700 border-slate-200'
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', STAGE_DOT_COLORS[stage] || 'bg-slate-400')} />
                {stage}
              </span>
              <span className="text-xs text-slate-400 ml-1">
                {items.length} action{items.length !== 1 ? 's' : ''}
                {doneCount > 0 && ` · ${doneCount} done`}
              </span>
            </button>

            {/* Table for this stage */}
            {!isCollapsed && (
              <div className="border-t border-slate-100">
                <ActionTable
                  actions={items}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  showArchived={showArchived}
                  hideStageColumn
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
