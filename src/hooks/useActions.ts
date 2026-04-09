'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Action, FilterState } from '@/lib/types'
import { toast } from 'sonner'

const DEBOUNCE_SAVE_MS = 5 * 60 * 1000 // 5 minutes

export function useActions(showArchived: boolean = false) {
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChanges = useRef(false)

  const scheduleVersionSave = useCallback(() => {
    hasUnsavedChanges.current = true
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      if (hasUnsavedChanges.current) {
        try {
          await fetch('/api/versions', { method: 'POST' })
          hasUnsavedChanges.current = false
          toast.success('Version saved automatically', { duration: 2000 })
        } catch (e) {
          console.error('Failed to save version', e)
        }
      }
    }, DEBOUNCE_SAVE_MS)
  }, [])

  const fetchActions = useCallback(async () => {
    try {
      const res = await fetch(`/api/actions?archived=${showArchived}`)
      const data = await res.json()
      setActions(data || [])
    } catch (e) {
      toast.error('Failed to load actions')
    } finally {
      setLoading(false)
    }
  }, [showArchived])

  useEffect(() => {
    fetchActions()
  }, [fetchActions])

  const addAction = useCallback(async (action: Omit<Action, 'id' | 'created_at' | 'updated_at' | 'archived'>) => {
    const res = await fetch('/api/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
    })
    if (!res.ok) throw new Error('Failed to add action')
    const newAction = await res.json()
    setActions(prev => [newAction, ...prev])
    scheduleVersionSave()
    return newAction
  }, [scheduleVersionSave])

  const updateAction = useCallback(async (id: string, updates: Partial<Action>) => {
    const res = await fetch(`/api/actions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) throw new Error('Failed to update action')
    const updated = await res.json()
    setActions(prev => {
      // If archived (marked done), remove from active list
      if (updated.archived && !showArchived) {
        return prev.filter(a => a.id !== id)
      }
      return prev.map(a => a.id === id ? updated : a)
    })
    scheduleVersionSave()
    return updated
  }, [scheduleVersionSave, showArchived])

  const deleteAction = useCallback(async (id: string) => {
    const res = await fetch(`/api/actions/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete action')
    setActions(prev => prev.filter(a => a.id !== id))
    scheduleVersionSave()
  }, [scheduleVersionSave])

  return { actions, loading, fetchActions, addAction, updateAction, deleteAction }
}

export function useFilteredActions(actions: Action[], filters: FilterState) {
  return actions.filter(action => {
    if (filters.owner && filters.owner !== 'all' && action.owner !== filters.owner) return false
    if (filters.quarter && filters.quarter !== 'all' && action.impact_quarter !== filters.quarter) return false
    if (filters.stage && filters.stage !== 'all' && action.stage !== filters.stage) return false
    if (filters.status === 'done' && !action.status) return false
    if (filters.status === 'pending' && action.status) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      if (!action.action_list.toLowerCase().includes(search) &&
          !action.owner.toLowerCase().includes(search) &&
          !action.stage.toLowerCase().includes(search) &&
          !action.kpi.toLowerCase().includes(search)) {
        return false
      }
    }
    return true
  })
}
