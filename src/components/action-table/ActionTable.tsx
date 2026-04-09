'use client'

import { useState } from 'react'
import { Action } from '@/lib/types'
import { STAGE_COLORS, QUARTERS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ArchiveRestore, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EditActionDialog } from '@/components/dialogs/EditActionDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const FADE_DURATION = 400 // ms

export function ActionTable({ actions, onUpdate, onDelete, showArchived = false }: ActionTableProps) {
  const [editingAction, setEditingAction] = useState<Action | null>(null)
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set())

  const handleDone = (action: Action) => {
    // Start fade animation
    setFadingIds(prev => new Set(prev).add(action.id))
    // After animation completes, trigger the actual update (optimistic already handles UI)
    setTimeout(() => {
      onUpdate(action.id, { status: true, archived: true })
      setFadingIds(prev => { const s = new Set(prev); s.delete(action.id); return s })
    }, FADE_DURATION)
  }

  const handleRestore = async (action: Action) => {
    await onUpdate(action.id, { status: false, archived: false })
  }

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
    <>
      <div className="rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[160px] font-semibold text-slate-700">Stage</TableHead>
              <TableHead className="font-semibold text-slate-700">Action</TableHead>
              <TableHead className="w-[120px] font-semibold text-slate-700">Owner</TableHead>
              <TableHead className="w-[100px] font-semibold text-slate-700">Quarter</TableHead>
              <TableHead className="font-semibold text-slate-700">KPI</TableHead>
              <TableHead className="w-[80px] text-center font-semibold text-slate-700">Done</TableHead>
              <TableHead className="w-[80px] text-center font-semibold text-slate-700">Edit</TableHead>
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
                  className="hover:bg-slate-50"
                >
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs font-medium whitespace-nowrap',
                        STAGE_COLORS[action.stage] || 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {action.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-800">{action.action_list}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-700">{action.owner}</span>
                  </TableCell>
                  <TableCell>
                    {showArchived ? (
                      action.impact_quarter && (
                        <Badge variant="secondary" className="text-xs">{action.impact_quarter}</Badge>
                      )
                    ) : (
                      <Select
                        value={action.impact_quarter || ''}
                        onValueChange={v => onUpdate(action.id, { impact_quarter: v })}
                      >
                        <SelectTrigger className="h-7 w-[78px] text-xs border-transparent hover:border-slate-200 focus:border-slate-300 shadow-none px-2">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {QUARTERS.map(q => (
                            <SelectItem key={q} value={q} className="text-xs">{q}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600 line-clamp-2">{action.kpi}</span>
                  </TableCell>
                  <TableCell className="text-center">
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
                        <Check
                          className={cn(
                            'h-3.5 w-3.5 transition-all duration-150',
                            isFading ? 'text-white' : 'text-transparent group-hover:text-green-500'
                          )}
                        />
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500 hover:text-blue-600"
                        onClick={() => setEditingAction(action)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-500 hover:text-red-600"
                          >
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
                            <AlertDialogAction
                              onClick={() => onDelete(action.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {editingAction && (
        <EditActionDialog
          action={editingAction}
          onClose={() => setEditingAction(null)}
          onSave={async (updates) => {
            await onUpdate(editingAction.id, updates)
            setEditingAction(null)
          }}
        />
      )}
    </>
  )
}
