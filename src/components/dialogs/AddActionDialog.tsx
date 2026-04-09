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

interface AddActionDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (action: Omit<Action, 'id' | 'created_at' | 'updated_at' | 'archived'>) => Promise<void>
}

export function AddActionDialog({ open, onClose, onAdd }: AddActionDialogProps) {
  const [formData, setFormData] = useState({
    stage: '',
    action_list: '',
    owner: '',
    impact_quarter: '',
    kpi: '',
    status: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.stage) errs.stage = 'Stage is required'
    if (!formData.action_list.trim()) errs.action_list = 'Action is required'
    if (!formData.owner.trim()) errs.owner = 'Owner is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await onAdd(formData)
      setFormData({ stage: '', action_list: '', owner: '', impact_quarter: '', kpi: '', status: false })
      setErrors({})
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add New Action</DialogTitle>
          <DialogDescription>Fill in the details for the new action item.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stage">Stage <span className="text-red-500">*</span></Label>
              <Select value={formData.stage} onValueChange={v => setFormData(p => ({ ...p, stage: v }))}>
                <SelectTrigger id="stage" className={errors.stage ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.stage && <p className="text-xs text-red-500">{errors.stage}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quarter">Impact Quarter</Label>
              <Select value={formData.impact_quarter} onValueChange={v => setFormData(p => ({ ...p, impact_quarter: v }))}>
                <SelectTrigger id="quarter">
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  {QUARTERS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="action_list">Action <span className="text-red-500">*</span></Label>
            <Textarea
              id="action_list"
              placeholder="Describe the action..."
              value={formData.action_list}
              onChange={e => setFormData(p => ({ ...p, action_list: e.target.value }))}
              className={errors.action_list ? 'border-red-500' : ''}
              rows={2}
            />
            {errors.action_list && <p className="text-xs text-red-500">{errors.action_list}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="owner">Owner <span className="text-red-500">*</span></Label>
            <Input
              id="owner"
              placeholder="e.g. Arianna, Jinjin/Nic"
              value={formData.owner}
              onChange={e => setFormData(p => ({ ...p, owner: e.target.value }))}
              className={errors.owner ? 'border-red-500' : ''}
            />
            {errors.owner && <p className="text-xs text-red-500">{errors.owner}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kpi">Measurable KPI</Label>
            <Textarea
              id="kpi"
              placeholder="Define measurable success criteria..."
              value={formData.kpi}
              onChange={e => setFormData(p => ({ ...p, kpi: e.target.value }))}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Action'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
