'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { History, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
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
  snapshot: unknown[]
}

interface VersionHistoryProps {
  onRestore: () => void
}

export function VersionHistory({ onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [open, setOpen] = useState(false)
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
      setOpen(false)
    } catch (e) {
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
        <CollapsibleContent className="absolute right-0 top-full mt-1 z-50 w-72 rounded-md border border-slate-200 bg-white shadow-lg">
          <div className="p-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-700">Version History</p>
            <p className="text-xs text-slate-400 mt-0.5">Auto-saved every 5 min after changes</p>
          </div>
          {versions.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">No versions saved yet</div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {versions.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-slate-700">{v.version_label}</p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(v.saved_at), 'MMM d, yyyy HH:mm')}
                      {v.snapshot && ` · ${(v.snapshot as unknown[]).length} items`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-amber-600"
                    onClick={() => setRestoreId(v.id)}
                    title="Restore this version"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog open={!!restoreId} onOpenChange={r => !r && setRestoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Version</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all current actions with the selected version snapshot.
              The current state will be saved as a new version before restoring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={loading} className="bg-amber-600 hover:bg-amber-700">
              {loading ? 'Restoring...' : 'Restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
