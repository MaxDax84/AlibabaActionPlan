import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('database_versions')
    .select('*')
    .order('saved_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST() {
  const supabase = getSupabase()
  // Save current state of all actions as a version snapshot
  const { data: actions, error: fetchError } = await supabase
    .from('actions')
    .select('*')
    .order('created_at', { ascending: true })

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const { data, error } = await supabase
    .from('database_versions')
    .insert([{
      snapshot: actions,
      saved_at: new Date().toISOString(),
      version_label: `Version ${new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })}`
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
