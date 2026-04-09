'use client'

import { useState, useRef } from 'react'
import { Action } from '@/lib/types'
import { STAGE_COLORS, STAGES } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, ArchiveRestore, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuarterMultiSelect, parseQuarters } from '@/components/ui/quarter-multi-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ActionTableProps {
  actions: Action[]
  onUpdate: (id: string, updates: Partial<Action>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  showArchived?: boolean
}

const FADE_DURATION = 400

// Inline editable text cell — click to edit, blur/Enter to save
function InlineText({
  value,
  onSave,
  className,
  multiline = false,
}: {
  value: string
  onSave: (v: string) => void
  className?: string
  multiline?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  const start = () => {
    setDraft(value)
    setEditing(true)
    setTimeout(() => ref.current?.focus(), 0)
  }

  const commit = () => {
    setEditing(false)
    if (draft.trim() !== value) onSave(draft.trim())
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commit() }
    if (e.key === 'Escape') { setEditing(false); setDraft(value) }
  }

  if (editing) {
    const shared = {
      ref,
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: onKey,
      className: cn(
        'w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm text-slate-800',
        'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent',
        className
      ),
    }
    return multiline
      ? <textarea {...shared} rows={2} style={{ resize: 'none' }} />
      : <input {...shared} type="text" />
  }

  return (
    <span
      onClick={start}
      title="Click to edit"
      className={cn(
        'block cursor-pointer rounded px-1 -mx-1 py-0.5 text-sm text-slate-800',
        'hover:bg-slate-100 transition-colors',
        className
      )}
    >
      {value || <span className="text-slate-300 italic">—</span>}
    </span>
  )
}

export function ActionTable({ actions, onUpdate, onDelete, showArchived = false }: ActionTableProps) {
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set())

  const handleDone = (action: Action) => {
    setFadingIds(prev => new Set(prev).add(action.id))
    setTimeout(() => {
      onUpdate(action.id, { status: true, archived: true })
      setFadingIds(prev => { const s = new Set(prev); s.delete(action.id); return s })
    }, FADE_DURATION)
  }

  const handleRestore = (action: Action) =>
    onUpdate(action.id, { status: false, archived: false })

  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="text-5xl mb-4">📋</div>
        <p className="text-lg font-medium">No actions found</p>
        <p className="text-sm mt-1">
          {showArchived ? 'No archived actions yet.' : 'Add a new action to get started.'}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="w-[170px] font-semibold text-slate-700">Stage</TableHead>
            <TableHead className="font-semibold text-slate-700">Action</TableHead>
            <TableHead className="w-[120px] font-semibold text-slate-700">Owner</TableHead>
            <TableHead className="w-[90px] font-semibold text-slate-700">Quarter</TableHead>
            <TableHead className="w-[220px] font-semibold text-slate-700">KPI</TableHead>
            <TableHead className="w-[70px] text-center font-semibold text-slate-700">Done</TableHead>
            <TableHead className="w-[50px] text-center font-semibold text-slate-700"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map((action) => {
            const isFading = fadingIds.has(action.id)
            return (
              <TableRow
                key={action.id}
                style={{
                  transition: `opacity ${FADE_DURATION}ms ease, transform ${FADE_DURATION}ms ease`,
                  opacity: isFading ? 0 : 1,
                  transform: isFading ? 'translateX(12px)' : 'translateX(0)',
                }}
                className="hover:bg-slate-50/60 align-top"
              >
                {/* Stage */}
                <TableCell className="py-2">
                  {showArchived ? (
                    <Badge
                      variant="outline"
                      className={cn('text-xs font-medium whitespace-nowrap', STAGE_COLORS[action.stage] || 'bg-slate-100 text-slate-700')}
                    >
                      {action.stage}
                    </Badge>
                  ) : (
                    <Select
                      value={action.stage}
                      onValueChange={v => onUpdate(action.id, { stage: v })}
                    >
                      <SelectTrigger className="h-7 text-xs border-transparent hover:border-slate-200 focus:border-slate-300 shadow-none px-1 w-full">
                        <Badge
                          variant="outline"
                          className={cn('text-xs font-medium whitespace-nowrap pointer-events-none', STAGE_COLORS[action.stage] || 'bg-slate-100 text-slate-700')}
                        >
                          {action.stage}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map(s => (
                          <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>

                {/* Action (read-only) */}
                <TableCell className="py-2">
                  <span className="text-sm text-slate-800">{action.action_list}</span>
                </TableCell>

                {/* Owner */}
                <TableCell className="py-2">
                  {showArchived ? (
                    <span className="text-sm font-medium text-slate-700">{action.owner}</span>
                  ) : (
                    <InlineText
                      value={action.owner}
                      onSave={v => onUpdate(action.id, { owner: v })}
                      className="font-medium"
                    />
                  )}
                </TableCell>

                {/* Quarter */}
                <TableCell className="py-2">
                  {showArchived ? (
                    <div className="flex flex-wrap gap-1">
                      {parseQuarters(action.impact_quarter).map(q => (
                        <Badge key={q} variant="secondary" className="text-xs px-1.5 py-0">{q}</Badge>
                      ))}
                    </div>
                  ) : (
                    <QuarterMultiSelect
                      value={action.impact_quarter || ''}
                      onChange={v => onUpdate(action.id, { impact_quarter: v })}
                      inline
                    />
                  )}
                </TableCell>

                {/* KPI */}
                <TableCell className="py-2">
                  {showArchived ? (
                    <span className="text-xs text-slate-600">{action.kpi}</span>
                  ) : (
                    <InlineText
                      value={action.kpi}
                      onSave={v => onUpdate(action.id, { kpi: v })}
                      className="text-xs text-slate-600"
                      multiline
                    />
                  )}
                </TableCell>

                {/* Done / Restore */}
                <TableCell className="py-2 text-center">
                  {showArchived ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestore(action)}
                      className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700"
                    >
                      <ArchiveRestore className="h-3.5 w-3.5 mr-1" />
                      Restore
                    </Button>
                  ) : (
                    <button
                      onClick={() => handleDone(action)}
                      disabled={isFading}
                      title="Mark as done"
                      className={cn(
                        'group w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-150',
                        'border-slate-300 hover:border-green-500 hover:bg-green-50',
                        isFading && 'border-green-500 bg-green-500'
                      )}
                    >
                      <Check className={cn(
                        'h-3.5 w-3.5 transition-all duration-150',
                        isFading ? 'text-white' : 'text-transparent group-hover:text-green-500'
                      )} />
                    </button>
                  )}
                </TableCell>

                {/* Delete */}
                <TableCell className="py-2 text-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Action</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this action? This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(action.id)} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
