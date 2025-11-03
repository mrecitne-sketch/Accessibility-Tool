import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Public stats used on the marketing homepage
export async function GET() {
  try {
    const supabase = await createAdminClient()

    // 1) Total completed scans (websites analyzed)
    const { count: totalScans, error: countError } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    if (countError) throw countError

    // 2) Sum of all violations across completed scans
    // Fetch only the field we need to keep payload small
    const { data: violationsRows, error: violationsError } = await supabase
      .from('scans')
      .select('violations_data')
      .eq('status', 'completed')
      .limit(5000)

    if (violationsError) throw violationsError

    let totalIssues = 0
    for (const row of violationsRows || []) {
      if (Array.isArray(row.violations_data)) {
        totalIssues += row.violations_data.length
      }
    }

    // 3) Average score across completed scans (used as Accuracy Rate for now)
    const { data: scoreRows, error: scoreError } = await supabase
      .from('scans')
      .select('score')
      .eq('status', 'completed')
      .not('score', 'is', null)
      .limit(5000)

    if (scoreError) throw scoreError

    let avgScore = 0
    if (scoreRows && scoreRows.length > 0) {
      const sum = scoreRows.reduce((acc: number, row: any) => acc + (row.score || 0), 0)
      avgScore = Math.round(sum / scoreRows.length)
    }

    // 4) Average scan duration if column exists
    let averageScanTimeSec: number | null = null
    const { data: durRows } = await supabase
      .from('scans')
      .select('duration_ms')
      .eq('status', 'completed')
      .not('duration_ms', 'is', null)
      .limit(5000)
    if (durRows && durRows.length > 0) {
      const sum = durRows.reduce((acc: number, r: any) => acc + (r.duration_ms || 0), 0)
      averageScanTimeSec = Math.round(sum / durRows.length / 1000)
    }

    return NextResponse.json({
      totalScans: totalScans || 0,
      totalIssues,
      averageScore: avgScore,
      averageScanTimeSec,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load stats' }, { status: 500 })
  }
}


