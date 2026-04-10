'use client'

import { useState, useMemo } from 'react'
import { useActions, useFilteredActions } from '@/hooks/useActions'
import { FilterState, Action } from '@/lib/types'
import { ActionTable } from '@/components/action-table/ActionTable'
import { GroupedActionTable } from '@/components/action-table/GroupedActionTable'
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
  owner: [],
  domain: [],
  stage: [],
  status: 'all',
  search: '',
}

export default function Home() {
  const [tab, setTab] = useState<'active' | 'archive'>('active')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [exporting, setExporting] = useState(false)

  // Single hook — loads everything, no tab-based reload
  const { actions, loading, fetchActions, addAction, updateAction, deleteAction } = useActions()

  const isArchive = tab === 'archive'
  const filteredActions = useFilteredActions(actions, filters, isArchive)

  // For filter dropdowns: show options relevant to current tab
  const tabActions = useMemo(() => actions.filter(a => a.archived === isArchive), [actions, isArchive])

  const handleAdd = async (data: Parameters<typeof addAction>[0]) => {
    try {
      await addAction(data)
      toast.success('Action added')
    } catch (e) {
      toast.error('Failed to add action')
    }
  }

  const handleUpdate = async (id: string, updates: Partial<Action>) => {
    try {
      await updateAction(id, updates)
      if (updates.status === true) {
        toast.success('Marked as done — moved to Archive')
      } else if (updates.archived === false) {
        toast.success('Restored to Active')
      } else {
        toast.success('Saved')
      }
    } catch (e) {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAction(id)
      toast.success('Deleted')
    } catch (e) {
      toast.error('Failed to delete')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportToExcel(filteredActions, `action-plan-${tab}`)
      toast.success('Excel exported')
    } catch (e) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const stats = useMemo(() => ({
    total: actions.filter(a => !a.archived).length,
    pending: actions.filter(a => !a.archived && !a.status).length,
    done: actions.filter(a => a.archived).length,
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
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4">
            <p className="text-xs text-slate-500 mb-1 truncate">Active</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4">
            <p className="text-xs text-slate-500 mb-1 truncate">In Progress</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4">
            <p className="text-xs text-slate-500 mb-1 truncate">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.done}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={v => { setTab(v as 'active' | 'archive'); setFilters(defaultFilters) }}>
          <div className="flex flex-col gap-3 mb-4">
            <TabsList className="self-start">
              <TabsTrigger value="active" className="gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" />
                Active
                {stats.total > 0 && (
                  <span className="ml-1 text-xs bg-slate-200 text-slate-600 rounded-full px-1.5 py-0.5 leading-none">
                    {stats.total}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="archive" className="gap-1.5">
                <Archive className="h-3.5 w-3.5" />
                Archive
                {stats.done > 0 && (
                  <span className="ml-1 text-xs bg-slate-200 text-slate-600 rounded-full px-1.5 py-0.5 leading-none">
                    {stats.done}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <FilterBar filters={filters} onFiltersChange={setFilters} actions={tabActions} />
          </div>

          <div className="bg-white rounded-lg border border-slate-200">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                <TabsContent value="active" className="m-0">
                  <GroupedActionTable
                    actions={filteredActions}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                </TabsContent>
                <TabsContent value="archive" className="m-0">
                  <GroupedActionTable
                    actions={filteredActions}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    showArchived
                  />
                </TabsContent>
              </>
            )}
          </div>

          {filteredActions.length > 0 && (
            <p className="text-xs text-slate-400 mt-2 text-right">
              Showing {filteredActions.length} of {tabActions.length}
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
