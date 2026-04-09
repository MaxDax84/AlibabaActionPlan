import ExcelJS from 'exceljs'
import { Action } from './types'
import { saveAs } from 'file-saver'

export async function exportToExcel(actions: Action[], filename: string = 'action-plan') {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Action Plan Manager'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet('Action Plan', {
    views: [{ state: 'frozen', ySplit: 1 }]
  })

  // Define columns
  worksheet.columns = [
    { header: 'Task ID',     key: 'task_id',     width: 12 },
    { header: 'Section',     key: 'stage',       width: 35 },
    { header: 'Domain',      key: 'domain',      width: 18 },
    { header: 'Action Plan', key: 'action_list', width: 55 },
    { header: 'Owner',       key: 'owner',       width: 20 },
    { header: 'Metric',      key: 'kpi',         width: 40 },
    { header: 'Status',      key: 'status',      width: 14 },
    { header: 'Created At',  key: 'created_at',  width: 20 },
  ]

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' },
    }
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF334155' } }
    }
  })
  headerRow.height = 30

  // Add data rows
  actions.forEach((action, index) => {
    const row = worksheet.addRow({
      task_id:     action.task_id,
      stage:       action.stage,
      domain:      action.domain,
      action_list: action.action_list,
      owner:       action.owner,
      kpi:         action.kpi,
      status:      action.status ? 'DONE' : 'IN PROGRESS',
      created_at:  new Date(action.created_at).toLocaleDateString('en-US'),
    })

    // Alternate row colors
    const bgColor = index % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF'
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
      cell.alignment = { vertical: 'middle', wrapText: true }
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      }
    })

    // Color code status cell
    const statusCell = row.getCell('status')
    if (action.status) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }
      statusCell.font = { color: { argb: 'FF065F46' }, bold: true }
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }
      statusCell.font = { color: { argb: 'FF92400E' }, bold: true }
    }

    row.height = 25
  })

  // Auto-filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 8 }
  }

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
}
