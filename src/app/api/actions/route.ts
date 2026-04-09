import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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

  const { data, error } = await supabase
    .from('actions')
    .insert([{
      stage: body.stage,
      action_list: body.action_list,
      owner: body.owner,
      impact_quarter: body.impact_quarter,
      kpi: body.kpi || '',
      status: body.status || false,
      archived: false,
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
