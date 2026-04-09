'use client'

import { useState } from 'react'
import { Action } from '@/lib/types'
import { STAGE_COLORS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, ArchiveRestore } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EditActionDialog } from '@/components/dialogs/EditActionDialog'
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

export function ActionTable({ actions, onUpdate, onDelete, showArchived = false }: ActionTableProps) {
  const [editingAction, setEditingAction] = useState<Action | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleStatusToggle = async (action: Action) => {
    setLoadingId(action.id)
    try {
      await onUpdate(action.id, { status: !action.status, archived: !action.status })
    } finally {
      setLoadingId(null)
    }
  }

  const handleRestore = async (action: Action) => {
    setLoadingId(action.id)
    try {
      await onUpdate(action.id, { status: false, archived: false })
    } finally {
      setLoadingId(null)
    }
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
              <TableHead className="w-[100px] text-center font-semibold text-slate-700">Status</TableHead>
              <TableHead className="w-[100px] text-center font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.map((action) => (
              <TableRow
                key={action.id}
                className={cn(
                  'transition-colors',
                  action.status ? 'bg-green-50/40 opacity-75' : 'hover:bg-slate-50'
                )}
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
                  <span className={cn(
                    'text-sm',
                    action.status ? 'line-through text-slate-400' : 'text-slate-800'
                  )}>
                    {action.action_list}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-slate-700">{action.owner}</span>
                </TableCell>
                <TableCell>
                  {action.impact_quarter && (
                    <Badge variant="secondary" className="text-xs">
                      {action.impact_quarter}
                    </Badge>
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
                      disabled={loadingId === action.id}
                      className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700"
                    >
                      <ArchiveRestore className="h-3.5 w-3.5 mr-1" />
                      Restore
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={action.status}
                        onCheckedChange={() => handleStatusToggle(action)}
                        disabled={loadingId === action.id}
                        className="data-[state=checked]:bg-green-500"
                      />
                      {action.status && (
                        <span className="text-xs text-green-600 font-medium">DONE</span>
                      )}
                    </div>
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
            ))}
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
