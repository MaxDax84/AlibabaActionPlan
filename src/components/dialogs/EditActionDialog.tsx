'use client'

import { useState } from 'react'
import { Action } from '@/lib/types'
import { STAGES, DOMAINS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EditActionDialogProps {
  action: Action
  onClose: () => void
  onSave: (updates: Partial<Action>) => Promise<void>
}

export function EditActionDialog({ action, onClose, onSave }: EditActionDialogProps) {
  const [formData, setFormData] = useState({
    task_id: action.task_id,
    stage: action.stage,
    domain: action.domain,
    action_list: action.action_list,
    owner: action.owner,
    kpi: action.kpi,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Action</DialogTitle>
          <DialogDescription>Modify the action details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Section</Label>
              <Select value={formData.stage} onValueChange={v => setFormData(p => ({ ...p, stage: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Domain</Label>
              <Select value={formData.domain} onValueChange={v => setFormData(p => ({ ...p, domain: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Task ID</Label>
            <Input
              value={formData.task_id}
              onChange={e => setFormData(p => ({ ...p, task_id: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Action Plan</Label>
            <Textarea
              value={formData.action_list}
              onChange={e => setFormData(p => ({ ...p, action_list: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Owner</Label>
            <Input
              value={formData.owner}
              onChange={e => setFormData(p => ({ ...p, owner: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Metric</Label>
            <Textarea
              value={formData.kpi}
              onChange={e => setFormData(p => ({ ...p, kpi: e.target.value }))}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
