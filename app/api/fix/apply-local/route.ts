import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateUnifiedDiff } from '@/lib/diff';
import { createTarGz } from '@/lib/tar';

interface ApplyLocalBody {
  scanId: string;
  violationKeys: string[]; // ["<violation.id>-<index>"]
}

export async function POST(request: NextRequest) {
  try {
    const { scanId, violationKeys } = (await request.json()) as ApplyLocalBody;
    if (!scanId || !Array.isArray(violationKeys) || violationKeys.length === 0) {
      return NextResponse.json({ error: 'scanId and violationKeys are required' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const { data: scan, error } = await supabase
      .from('scans')
      .select('id, violations_data')
      .eq('id', scanId)
      .single();

    if (error || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    const violations: any[] = Array.isArray(scan.violations_data) ? scan.violations_data : [];

    const files: { name: string; content: string }[] = [];
    const manifest: Array<{ key: string; filePath: string; patchPath: string }> = [];

    for (const key of violationKeys) {
      const sepIndex = key.lastIndexOf('-');
      if (sepIndex === -1) continue;
      const vId = key.slice(0, sepIndex);
      const idx = Number.parseInt(key.slice(sepIndex + 1), 10);
      if (Number.isNaN(idx)) continue;

      let violation: any | undefined = violations[idx];
      if (!violation || violation.id !== vId) {
        const matches = violations.filter((v: any) => v.id === vId);
        violation = matches[idx];
      }
      if (!violation || !violation.fix) continue;

      const before: string = violation.fix.before || '';
      const after: string = violation.fix.after || '';
      const firstNode = Array.isArray(violation.nodes) ? violation.nodes[0] : undefined;
      const sourcePath: string | undefined = firstNode?.data?.sourcePath;
      const filePath = sourcePath || `${violation.id}.html`;
      const diff = generateUnifiedDiff(before, after, filePath);
      const safeName = filePath.replace(/^\/+/, '').replace(/[^a-zA-Z0-9._/\-]/g, '_');
      const patchName = `patches/${safeName}.diff`;
      files.push({ name: patchName, content: diff + '\n' });
      manifest.push({ key, filePath, patchPath: patchName });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No patches generated from provided keys' }, { status: 400 });
    }

    // Add manifest and README
    files.push({ name: 'manifest.json', content: JSON.stringify({ scanId, generatedAt: new Date().toISOString(), patches: manifest }, null, 2) });
    files.push({ name: 'README.txt', content: `AllyFix patches for scan ${scanId}\n\nApply with:\n\n  git checkout -b allyfix/fixes-${scanId}\n  tar -xzf allyfix-patches-${scanId}.tar.gz\n  git apply --3way\n  git commit -m "AllyFix: apply accessibility fixes"\n\n` });

    const tarGz = createTarGz(files);

    return new NextResponse(tarGz, {
      status: 200,
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="allyfix-patches-${scanId}.tar.gz"`,
        'Content-Length': String(tarGz.byteLength),
      },
    });
  } catch (err) {
    console.error('fix/apply-local error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


