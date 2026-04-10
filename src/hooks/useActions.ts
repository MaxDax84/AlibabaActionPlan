'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Action, FilterState } from '@/lib/types'
import { toast } from 'sonner'

const DEBOUNCE_SAVE_MS = 5 * 60 * 1000 // 5 minutes

export function useActions() {
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
      // Load both active and archived in parallel
      const [activeRes, archivedRes] = await Promise.all([
        fetch('/api/actions?archived=false'),
        fetch('/api/actions?archived=true'),
      ])
      const [active, archived] = await Promise.all([activeRes.json(), archivedRes.json()])
      setActions([...(active || []), ...(archived || [])])
    } catch (e) {
      toast.error('Failed to load actions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActions()
  }, [fetchActions])

  const addAction = useCallback(async (action: Omit<Action, 'id' | 'created_at' | 'updated_at' | 'archived'>) => {
    // Optimistic: create a temp action immediately
    const tempId = `temp-${Date.now()}`
    const optimistic: Action = {
      ...action,
      id: tempId,
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setActions(prev => [optimistic, ...prev])

    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })
      if (!res.ok) throw new Error('Failed to add action')
      const newAction = await res.json()
      // Replace temp with real
      setActions(prev => prev.map(a => a.id === tempId ? newAction : a))
      scheduleVersionSave()
      return newAction
    } catch (err) {
      // Rollback
      setActions(prev => prev.filter(a => a.id !== tempId))
      throw err
    }
  }, [scheduleVersionSave])

  const updateAction = useCallback(async (id: string, updates: Partial<Action>) => {
    // Optimistic: apply update immediately
    let previous: Action | undefined
    setActions(prev => {
      previous = prev.find(a => a.id === id)
      return prev.map(a => a.id === id ? { ...a, ...updates } : a)
    })

    try {
      const res = await fetch(`/api/actions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update action')
      const updated = await res.json()
      // Sync with real server response
      setActions(prev => prev.map(a => a.id === id ? updated : a))
      scheduleVersionSave()
      return updated
    } catch (err) {
      // Rollback
      if (previous) {
        setActions(prev => prev.map(a => a.id === id ? previous! : a))
      }
      throw err
    }
  }, [scheduleVersionSave])

  const deleteAction = useCallback(async (id: string) => {
    // Optimistic: remove immediately
    let previous: Action | undefined
    setActions(prev => {
      previous = prev.find(a => a.id === id)
      return prev.filter(a => a.id !== id)
    })

    try {
      const res = await fetch(`/api/actions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete action')
      scheduleVersionSave()
    } catch (err) {
      // Rollback
      if (previous) {
        setActions(prev => [previous!, ...prev])
      }
      throw err
    }
  }, [scheduleVersionSave])

  return { actions, loading, fetchActions, addAction, updateAction, deleteAction }
}

export function useFilteredActions(actions: Action[], filters: FilterState, archived: boolean) {
  return actions.filter(action => {
    if (action.archived !== archived) return false
    if (filters.owner.length > 0 && !filters.owner.includes(action.owner)) return false
    if (filters.domain.length > 0 && !filters.domain.includes(action.domain)) return false
    if (filters.stage.length > 0 && !filters.stage.includes(action.stage)) return false
    if (filters.status === 'done' && !action.status) return false
    if (filters.status === 'pending' && action.status) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      if (!action.action_list.toLowerCase().includes(search) &&
          !action.owner.toLowerCase().includes(search) &&
          !action.stage.toLowerCase().includes(search) &&
          !action.domain.toLowerCase().includes(search) &&
          !action.kpi.toLowerCase().includes(search)) {
        return false
      }
    }
    return true
  })
}
