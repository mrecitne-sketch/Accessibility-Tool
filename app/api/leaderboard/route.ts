import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeFilter = searchParams.get('time') || 'all';

    const supabase = await createAdminClient();

    // Calculate date filter
    let dateFilter: Date | null = null;
    if (timeFilter === '24h') {
      dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
    } else if (timeFilter === '30d') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build query
    let query = supabase
      .from('scans')
      .select('id, url, score, level, created_at')
      .eq('status', 'completed')
      .not('score', 'is', null)
      .order('score', { ascending: false })
      .limit(100);

    if (dateFilter) {
      query = query.gte('created_at', dateFilter.toISOString());
    }

    const { data: scans, error } = await query;

    if (error) {
      console.error('Leaderboard query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Extract domain from URL and format data
    const leaderboard = (scans || []).map((scan, index) => {
      try {
        const urlObj = new URL(scan.url);
        const domain = urlObj.hostname.replace('www.', '');
        return {
          rank: index + 1,
          id: scan.id,
          site: domain,
          url: scan.url,
          score: scan.score,
          level: scan.level,
          created_at: scan.created_at,
        };
      } catch {
        return {
          rank: index + 1,
          id: scan.id,
          site: scan.url,
          url: scan.url,
          score: scan.score,
          level: scan.level,
          created_at: scan.created_at,
        };
      }
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

