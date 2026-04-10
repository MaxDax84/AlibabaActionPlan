'use client'

import { useState, useRef } from 'react'
import { Action } from '@/lib/types'
import { DOMAINS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Trash2, ArchiveRestore, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TableCell, TableRow } from '@/components/ui/table'
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

export const FADE_DURATION = 400

// ─── Inline editors ───────────────────────────────────────────

export function InlineText({
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

  const start = () => { setDraft(value); setEditing(true); setTimeout(() => ref.current?.focus(), 0) }
  const commit = () => { setEditing(false); if (draft.trim() !== value) onSave(draft.trim()) }
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
      className={cn('block cursor-pointer rounded px-1 -mx-1 py-0.5 text-sm text-slate-800 hover:bg-slate-100 transition-colors', className)}
    >
      {value || <span className="text-slate-300 italic">—</span>}
    </span>
  )
}

export function InlineDomain({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" title="Click to change domain"
          className="text-sm text-slate-700 cursor-pointer rounded px-1 -mx-1 py-0.5 hover:bg-slate-100 transition-colors focus:outline-none whitespace-nowrap">
          {value || <span className="text-slate-300 italic">—</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start" side="bottom" sideOffset={4} avoidCollisions>
        {DOMAINS.map(d => (
          <button key={d} type="button" onClick={() => { onSave(d); setOpen(false) }}
            className={cn('flex items-center w-full px-3 py-2 text-sm rounded hover:bg-slate-50 transition-colors text-left', d === value && 'bg-slate-50 font-semibold')}>
            {d}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// ─── Delete confirm shared ────────────────────────────────────

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Action</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to delete this action? This cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ─── Props ────────────────────────────────────────────────────

export interface ActionRowProps {
  action: Action
  onUpdate: (id: string, updates: Partial<Action>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  showArchived?: boolean
  showStageColumn?: boolean
  isFading: boolean
  onDone: () => void
}

// ─── Mobile card ──────────────────────────────────────────────

export function ActionCard({
  action,
  onUpdate,
  onDelete,
  showArchived = false,
  isFading,
  onDone,
}: ActionRowProps) {
  return (
    <div
      style={{
        transition: `opacity ${FADE_DURATION}ms ease, transform ${FADE_DURATION}ms ease`,
        opacity: isFading ? 0 : 1,
        transform: isFading ? 'translateX(12px)' : 'translateX(0)',
      }}
      className={cn('border-b border-slate-100 last:border-0 px-3 py-3 space-y-2', action.status && 'bg-green-50/40')}
    >
      {/* Top row: task ID + domain + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {action.task_id && (
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {action.task_id}
            </span>
          )}
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            {action.domain}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {showArchived ? (
            <Button variant="ghost" size="sm"
              onClick={() => onUpdate(action.id, { archived: false })}
              className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700">
              <ArchiveRestore className="h-3.5 w-3.5 mr-1" />Restore
            </Button>
          ) : (
            <button onClick={onDone} title={action.status ? 'Mark as in progress' : 'Mark as done'}
              className={cn('group w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-150',
                action.status
                  ? 'border-green-500 bg-green-500 hover:bg-green-600 hover:border-green-600'
                  : 'border-slate-300 hover:border-green-500 hover:bg-green-50')}>
              <Check className={cn('h-3.5 w-3.5 transition-all duration-150',
                action.status ? 'text-white' : 'text-transparent group-hover:text-green-500')} />
            </button>
          )}
          <DeleteButton onDelete={() => onDelete(action.id)} />
        </div>
      </div>

      {/* Action plan text */}
      <div>
        {showArchived
          ? <p className="text-sm text-slate-800 leading-snug">{action.action_list}</p>
          : <InlineText value={action.action_list} onSave={v => onUpdate(action.id, { action_list: v })} multiline />
        }
      </div>

      {/* Owner + Metric */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs text-slate-400 w-12 shrink-0">Owner</span>
          {showArchived
            ? <span className="text-sm font-medium text-slate-700">{action.owner}</span>
            : <InlineText value={action.owner} onSave={v => onUpdate(action.id, { owner: v })} className="font-medium" />
          }
        </div>
        {action.kpi && (
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-slate-400 w-12 shrink-0">Metric</span>
            {showArchived
              ? <span className="text-xs text-slate-600">{action.kpi}</span>
              : <InlineText value={action.kpi} onSave={v => onUpdate(action.id, { kpi: v })} className="text-xs text-slate-600" multiline />
            }
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Desktop table row ────────────────────────────────────────

export function ActionRow({
  action,
  onUpdate,
  onDelete,
  showArchived = false,
  isFading,
  onDone,
}: ActionRowProps) {
  return (
    <TableRow
      style={{
        transition: `opacity ${FADE_DURATION}ms ease, transform ${FADE_DURATION}ms ease`,
        opacity: isFading ? 0 : 1,
        transform: isFading ? 'translateX(12px)' : 'translateX(0)',
      }}
      className={cn('align-top', action.status ? 'bg-green-50/40 hover:bg-green-50/60' : 'hover:bg-slate-50/60')}
    >
      {/* Task ID — read-only, system generated */}
      <TableCell className="py-2 w-[90px]">
        <span className="text-xs font-mono text-slate-400">{action.task_id}</span>
      </TableCell>

      {/* Domain */}
      <TableCell className="py-2 w-[130px]">
        {showArchived
          ? <span className="text-sm text-slate-700">{action.domain}</span>
          : <InlineDomain value={action.domain} onSave={v => onUpdate(action.id, { domain: v })} />
        }
      </TableCell>

      {/* Action Plan */}
      <TableCell className="py-2">
        {showArchived
          ? <span className="text-sm text-slate-800">{action.action_list}</span>
          : <InlineText value={action.action_list} onSave={v => onUpdate(action.id, { action_list: v })} multiline />
        }
      </TableCell>

      {/* Owner */}
      <TableCell className="py-2 w-[120px]">
        {showArchived
          ? <span className="text-sm font-medium text-slate-700">{action.owner}</span>
          : <InlineText value={action.owner} onSave={v => onUpdate(action.id, { owner: v })} className="font-medium" />
        }
      </TableCell>

      {/* Metric */}
      <TableCell className="py-2 w-[220px]">
        {showArchived
          ? <span className="text-xs text-slate-600">{action.kpi}</span>
          : <InlineText value={action.kpi} onSave={v => onUpdate(action.id, { kpi: v })} className="text-xs text-slate-600" multiline />
        }
      </TableCell>

      {/* Done / Restore */}
      <TableCell className="py-2 text-center w-[70px]">
        {showArchived ? (
          <Button variant="ghost" size="sm" onClick={() => onUpdate(action.id, { archived: false })}
            className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700">
            <ArchiveRestore className="h-3.5 w-3.5 mr-1" />Restore
          </Button>
        ) : (
          <button onClick={onDone} title={action.status ? 'Mark as in progress' : 'Mark as done'}
            className={cn('group w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-150',
              action.status
                ? 'border-green-500 bg-green-500 hover:bg-green-600 hover:border-green-600'
                : 'border-slate-300 hover:border-green-500 hover:bg-green-50')}>
            <Check className={cn('h-3.5 w-3.5 transition-all duration-150',
              action.status ? 'text-white' : 'text-transparent group-hover:text-green-500')} />
          </button>
        )}
      </TableCell>

      {/* Delete */}
      <TableCell className="py-2 text-center w-[50px]">
        <DeleteButton onDelete={() => onDelete(action.id)} />
      </TableCell>
    </TableRow>
  )
}
