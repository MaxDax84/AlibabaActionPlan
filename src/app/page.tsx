'use client'

import { useState, useMemo } from 'react'
import { useActions, useFilteredActions } from '@/hooks/useActions'
import { FilterState, Action } from '@/lib/types'
import { ActionTable } from '@/components/action-table/ActionTable'
import { AddActionDialog } from '@/components/dialogs/AddActionDialog'
import { FilterBar } from '@/components/filters/FilterBar'
import { VersionHistory } from '@/components/VersionHistory'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Download, Archive, ClipboardList, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { exportToExcel } from '@/lib/export'
import { Toaster } from 'sonner'

const defaultFilters: FilterState = {
  owner: 'all',
  quarter: 'all',
  stage: 'all',
  status: 'all',
  search: '',
}

export default function Home() {
  const [tab, setTab] = useState<'active' | 'archive'>('active')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [exporting, setExporting] = useState(false)

  const { actions, loading, fetchActions, addAction, updateAction, deleteAction } = useActions(tab === 'archive')
  const filteredActions = useFilteredActions(actions, filters)

  const handleAdd = async (data: Parameters<typeof addAction>[0]) => {
    try {
      await addAction(data)
      toast.success('Action added successfully')
    } catch (e) {
      toast.error('Failed to add action')
    }
  }

  const handleUpdate = async (id: string, updates: Partial<Action>) => {
    try {
      await updateAction(id, updates)
      if (updates.status === true) {
        toast.success('Action marked as done and archived')
      } else if (updates.archived === false) {
        toast.success('Action restored to active list')
      } else {
        toast.success('Action updated')
      }
    } catch (e) {
      toast.error('Failed to update action')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAction(id)
      toast.success('Action deleted')
    } catch (e) {
      toast.error('Failed to delete action')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportToExcel(filteredActions, `action-plan-${tab}`)
      toast.success('Excel file exported successfully')
    } catch (e) {
      toast.error('Failed to export')
    } finally {
      setExporting(false)
    }
  }

  const stats = useMemo(() => ({
    total: actions.length,
    done: actions.filter(a => a.status).length,
    pending: actions.filter(a => !a.status).length,
  }), [actions])

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Action Plan</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Strategic Task Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <VersionHistory onRestore={fetchActions} />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={exporting || filteredActions.length === 0}
                className="h-9 gap-1.5"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Export Excel</span>
              </Button>
              <Button size="sm" onClick={() => setShowAddDialog(true)} className="h-9 gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Action</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Total Actions</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.done}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={v => { setTab(v as 'active' | 'archive'); setFilters(defaultFilters) }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <TabsList className="self-start">
              <TabsTrigger value="active" className="gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" />
                Active
              </TabsTrigger>
              <TabsTrigger value="archive" className="gap-1.5">
                <Archive className="h-3.5 w-3.5" />
                Archive
              </TabsTrigger>
            </TabsList>
            <div className="flex-1">
              <FilterBar filters={filters} onFiltersChange={setFilters} actions={actions} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                <TabsContent value="active" className="m-0">
                  <div className="p-1">
                    <ActionTable
                      actions={filteredActions}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="archive" className="m-0">
                  <div className="p-1">
                    <ActionTable
                      actions={filteredActions}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      showArchived
                    />
                  </div>
                </TabsContent>
              </>
            )}
          </div>

          {filteredActions.length > 0 && (
            <p className="text-xs text-slate-400 mt-2 text-right">
              Showing {filteredActions.length} of {actions.length} actions
            </p>
          )}
        </Tabs>
      </main>

      <AddActionDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAdd}
      />
    </div>
  )
}
