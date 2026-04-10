'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { History, ChevronDown, ChevronUp, Eye, RotateCcw, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Action } from '@/lib/types'
import { STAGE_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Version {
  id: string
  version_label: string
  saved_at: string
  snapshot: Action[]
}

interface VersionHistoryProps {
  onRestore: () => void
}

// ── Snapshot preview modal ─────────────────────────────────────

function SnapshotPreview({
  version,
  onClose,
  onRestore,
}: {
  version: Version
  onClose: () => void
  onRestore: (id: string) => void
}) {
  const actions = version.snapshot || []

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div>
          <p className="text-sm font-semibold text-slate-800">{version.version_label}</p>
          <p className="text-xs text-slate-400">
            {format(new Date(version.saved_at), 'MMMM d, yyyy · HH:mm')}
            {' · '}{actions.length} action{actions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onRestore(version.id)}
            className="h-9 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <RotateCcw className="h-4 w-4" />
            <span>RESTORE THIS VERSION</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Snapshot content */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6">
        {actions.length === 0 ? (
          <p className="text-center text-slate-400 py-16">No actions in this snapshot</p>
        ) : (
          <div className="max-w-5xl mx-auto space-y-1">
            {actions.map((action) => (
              <div
                key={action.id}
                className={cn(
                  'bg-white rounded-md border border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-2',
                  action.archived && 'opacity-60'
                )}
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-slate-400 w-14">{action.task_id}</span>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full border font-medium',
                    STAGE_COLORS[action.stage] || 'bg-slate-100 text-slate-700 border-slate-200'
                  )}>
                    {action.domain || action.stage}
                  </span>
                </div>
                <p className="flex-1 text-sm text-slate-800 leading-snug">{action.action_list}</p>
                <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                  <span>{action.owner}</span>
                  {action.status && (
                    <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Done</span>
                  )}
                  {action.archived && (
                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Archived</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────

export function VersionHistory({ onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<Version | null>(null)
  const [restoreId, setRestoreId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) fetchVersions()
  }, [open])

  const fetchVersions = async () => {
    const res = await fetch('/api/versions')
    const data = await res.json()
    setVersions(data || [])
  }

  const handleRestore = async () => {
    if (!restoreId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/versions/${restoreId}/restore`, { method: 'POST' })
      if (!res.ok) throw new Error('Restore failed')
      toast.success('Database restored to previous version')
      onRestore()
      setRestoreId(null)
      setPreview(null)
      setOpen(false)
    } catch {
      toast.error('Failed to restore version')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Versions</span>
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="absolute right-0 top-full mt-1 z-50 w-80 rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="p-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-700">Version History</p>
            <p className="text-xs text-slate-400 mt-0.5">Auto-saved every 5 min after changes</p>
          </div>
          {versions.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">No versions saved yet</div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{v.version_label}</p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(v.saved_at), 'MMM d, yyyy HH:mm')}
                      {v.snapshot && ` · ${(v.snapshot as unknown[]).length} items`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-blue-600 shrink-0 ml-2"
                    onClick={() => { setPreview(v); setOpen(false) }}
                    title="Preview this version"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Snapshot preview fullscreen */}
      {preview && (
        <SnapshotPreview
          version={preview}
          onClose={() => setPreview(null)}
          onRestore={(id) => { setRestoreId(id) }}
        />
      )}

      {/* Restore confirmation */}
      <AlertDialog open={!!restoreId} onOpenChange={r => !r && setRestoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
            <AlertDialogDescription>
              All current actions will be replaced with this snapshot.
              The current state will be saved automatically before restoring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? 'Restoring...' : 'RESTORE THIS VERSION'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
