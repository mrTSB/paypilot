import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/agents - List agent templates
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get system agent templates
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .eq('is_system', true)
      .order('name')

    if (error) {
      console.error('Error fetching agents:', error)
      return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
    }

    // Get tone presets
    const { data: tonePresets } = await supabase
      .from('tone_presets')
      .select('*')
      .eq('is_system', true)

    return NextResponse.json({
      agents: agents || [],
      tonePresets: tonePresets || [],
    })
  } catch (error) {
    console.error('Agents API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
