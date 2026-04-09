'use client'

import { useState } from 'react'
import { Action } from '@/lib/types'
import { STAGES, QUARTERS } from '@/lib/constants'
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
    stage: action.stage,
    action_list: action.action_list,
    owner: action.owner,
    impact_quarter: action.impact_quarter,
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
              <Label>Stage</Label>
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
              <Label>Impact Quarter</Label>
              <Select value={formData.impact_quarter} onValueChange={v => setFormData(p => ({ ...p, impact_quarter: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  {QUARTERS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Action</Label>
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
            <Label>Measurable KPI</Label>
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
