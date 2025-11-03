import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateUnifiedDiff } from '@/lib/diff';

interface PreviewRequestBody {
  scanId: string;
  violationKey: string; // format: `${violation.id}-${index}`
}

// Simple in-memory cache for preview payloads (scoped to serverless container lifetime)
const CACHE_TTL_MS = 60_000; // 1 minute
const previewCache = new Map<string, { expires: number; data: any }>();

export async function POST(request: NextRequest) {
  try {
    const { scanId, violationKey } = (await request.json()) as PreviewRequestBody;

    if (!scanId || !violationKey) {
      return NextResponse.json(
        { error: 'scanId and violationKey are required' },
        { status: 400 }
      );
    }

    const cacheKey = `${scanId}:${violationKey}`;
    const cached = previewCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data);
    }

    const sepIndex = violationKey.lastIndexOf('-');
    if (sepIndex === -1) {
      return NextResponse.json(
        { error: 'Invalid violationKey format' },
        { status: 400 }
      );
    }

    const violationId = violationKey.slice(0, sepIndex);
    const indexStr = violationKey.slice(sepIndex + 1);
    const index = Number.parseInt(indexStr, 10);
    if (Number.isNaN(index)) {
      return NextResponse.json(
        { error: 'Invalid violation index in violationKey' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();
    const { data: scan, error } = await supabase
      .from('scans')
      .select('id, violations_data')
      .eq('id', scanId)
      .single();

    if (error || !scan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      );
    }

    const violations = Array.isArray(scan.violations_data) ? scan.violations_data : [];

    // In the UI, violationKey uses the GLOBAL index within the rendered list.
    // First, try to resolve by global index directly.
    let violation: any | undefined = violations[index];
    if (!violation || violation.id !== violationId) {
      // Fallback: treat index as nth occurrence for the given id
      const matches = violations.filter((v: any) => v.id === violationId);
      violation = matches[index];
    }

    if (!violation || !violation.fix) {
      return NextResponse.json(
        { error: 'Violation or fix not found' },
        { status: 404 }
      );
    }

    const before: string = violation.fix.before || '';
    const after: string = violation.fix.after || '';
    const explanation: string = violation.fix.explanation || '';

    const unifiedDiff = generateUnifiedDiff(before, after, `${violationId}.html`);

    const payload = { unifiedDiff, before, after, explanation };
    previewCache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, data: payload });
    return NextResponse.json(payload);
  } catch (err) {
    console.error('fix/preview error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


