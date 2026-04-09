import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabase()
  const { id } = await params

  // Get the version snapshot
  const { data: version, error: fetchError } = await supabase
    .from('database_versions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  // Save current state as a new version before restoring
  const { data: currentActions } = await supabase.from('actions').select('*')
  await supabase.from('database_versions').insert([{
    snapshot: currentActions,
    saved_at: new Date().toISOString(),
    version_label: `Before restore - ${new Date().toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })}`
  }])

  // Delete all current actions
  await supabase.from('actions').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // Re-insert from snapshot
  const snapshot = version.snapshot as Array<Record<string, unknown>>
  if (snapshot && snapshot.length > 0) {
    const { error: insertError } = await supabase.from('actions').insert(snapshot)
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
