import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateUnifiedDiff } from '@/lib/diff';
import { createBranchAndPr } from '@/lib/github';

interface CreatePrBody {
  scanId: string;
  violationKeys: string[];
  repo: string; // owner/name
  baseBranch: string;
  newBranch: string;
  commitMessage?: string;
  installationId?: number;
}

export async function POST(request: NextRequest) {
  const configured = Boolean(process.env.GITHUB_APP_ID && process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  if (!configured) {
    return NextResponse.json({ error: 'GitHub not configured' }, { status: 501 });
  }

  try {
    const { scanId, violationKeys, repo, baseBranch, newBranch, commitMessage, installationId } = (await request.json()) as CreatePrBody;
    if (!scanId || !Array.isArray(violationKeys) || violationKeys.length === 0 || !repo || !baseBranch || !newBranch) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Build minimal file->diff map based on sourcePath when available
    const changes: Array<{ path: string; diff: string }> = [];
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
      changes.push({ path: filePath, diff });
    }

    if (changes.length === 0) {
      return NextResponse.json({ error: 'No changes to propose' }, { status: 400 });
    }

    if (!installationId) {
      // Fall back to simulated response if no installation is selected
      const simulatedUrl = `https://github.com/${repo}/pull/preview-${Date.now()}`;
      return NextResponse.json({
        prUrl: simulatedUrl,
        repo,
        baseBranch,
        newBranch,
        commitMessage: commitMessage || 'AllyFix: apply accessibility fixes',
        filesChanged: changes.length,
        simulated: true,
      });
    }

    // Convert diffs to file contents by applying "after" only for now (MVP path).
    // A fuller implementation would parse and apply diffs. Here we commit the "after" snippets to the file path.
    const files: Array<{ path: string; content: string }> = [];
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
      const after: string = violation.fix.after || '';
      const firstNode = Array.isArray(violation.nodes) ? violation.nodes[0] : undefined;
      const sourcePath: string | undefined = firstNode?.data?.sourcePath;
      const filePath = sourcePath || `${violation.id}.html`;
      files.push({ path: filePath, content: after });
    }

    const result = await createBranchAndPr({
      installationId,
      repo,
      baseBranch,
      newBranch,
      commitMessage: commitMessage || 'AllyFix: apply accessibility fixes',
      files,
      title: 'AllyFix: Apply accessibility fixes',
    });

    return NextResponse.json({ ...result, filesChanged: files.length, simulated: false });
  } catch (err) {
    console.error('github/create-pr error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


