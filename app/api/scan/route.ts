import { NextRequest, NextResponse } from 'next/server';
import { scanURL } from '@/lib/scanner';
import { checkQuota, incrementScanCount } from '@/lib/quota';
import { createAdminClient } from '@/lib/supabase/server';
import { Violation } from '@/types/scan';
import { generateFixForViolation } from '@/lib/fix-engine';

export async function POST(request: NextRequest) {
  try {
    const { url, userId } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Check quota if user is authenticated
    if (userId) {
      const quotaCheck = await checkQuota(userId);
      if (!quotaCheck.canScan) {
        return NextResponse.json(
          { 
            error: 'Scan limit reached',
            scansRemaining: quotaCheck.scansRemaining 
          },
          { status: 429 }
        );
      }
    }

    // Create scan record
    const supabase = await createAdminClient();
    console.log('Admin client URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30));
    console.log('Service role key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: scanData, error: scanError } = await supabase
      .from('scans')
      .insert({
        user_id: userId || null,
        url,
        status: 'pending',
      })
      .select()
      .single();

    if (scanError || !scanData) {
      console.error('Scan creation error:', scanError);
      return NextResponse.json(
        { error: 'Failed to create scan', details: scanError?.message },
        { status: 500 }
      );
    }

    // Perform the scan
    let scanResult;
    try {
      scanResult = await scanURL(url);
    } catch (error) {
      // Update scan status to failed
      await supabase
        .from('scans')
        .update({ status: 'failed' })
        .eq('id', scanData.id);

      return NextResponse.json(
        { error: 'Failed to scan URL', details: String(error) },
        { status: 500 }
      );
    }

    // Generate fixes for violations
    const violationsWithFixes = scanResult.violations.map((violation: Violation) => {
      const fix = generateFixForViolation(violation);
      return {
        ...violation,
        fix,
      };
    });

    // Update scan with results
    const { error: updateError } = await supabase
      .from('scans')
      .update({
        status: 'completed',
        score: scanResult.score,
        level: scanResult.level,
        violations_data: violationsWithFixes,
      })
      .eq('id', scanData.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update scan results' },
        { status: 500 }
      );
    }

    // Increment scan count for authenticated users
    if (userId) {
      await incrementScanCount(userId);
    }

    return NextResponse.json({
      scanId: scanData.id,
      score: scanResult.score,
      level: scanResult.level,
      violations: violationsWithFixes,
    });

  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

