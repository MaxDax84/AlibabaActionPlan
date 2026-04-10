import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const DOMAIN_PREFIX: Record<string, string> = {
  'Business Analysis': 'BA',
  'ICP Operation':     'OP',
  'Lead Gen':          'LG',
  'Acquisition':       'AC',
  'CS & AM':           'CS',
  'Buyers':            'BY',
  'Gov (ITA)':         'GV',
  'Gov (SPA)':         'GV',
  'Gov (FRA)':         'GV',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateTaskId(supabase: any, domain: string): Promise<string> {
  const prefix = DOMAIN_PREFIX[domain] || 'XX'

  // Find all existing task_ids with this prefix and pick the next number
  const { data } = await supabase
    .from('actions')
    .select('task_id')
    .like('task_id', `${prefix}_%`)

  const max = (data || []).reduce((acc: number, row: Record<string, unknown>) => {
    const match = (row.task_id as string).match(/^[A-Z]+_(\d+)$/)
    if (match) return Math.max(acc, parseInt(match[1], 10))
    return acc
  }, 0)

  return `${prefix}_${String(max + 1).padStart(2, '0')}`
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const archived = searchParams.get('archived') === 'true'

  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .eq('archived', archived)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase()
  const body = await request.json()

  const task_id = await generateTaskId(supabase, body.domain || '')

  const { data, error } = await supabase
    .from('actions')
    .insert([{
      task_id,
      stage: body.stage,
      domain: body.domain || '',
      action_list: body.action_list,
      owner: body.owner,
      kpi: body.kpi || '',
      status: body.status || false,
      archived: false,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
