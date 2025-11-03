import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GitHub App installation callback target URL
// GitHub sends: installation_id, setup_action, and account info.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const installationId = searchParams.get('installation_id');
    const setupAction = searchParams.get('setup_action');

    if (!installationId) {
      return NextResponse.json({ error: 'installation_id required' }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // For now, user_id is null (anonymous). Later we will bind to authenticated user.
    await supabase.from('integrations').insert({
      user_id: null,
      provider: 'github',
      installation_id: Number(installationId),
      repos: null,
    });

    // Redirect back to app with success
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirect = `${appUrl}?github_install=success&installation_id=${installationId}&setup_action=${setupAction || ''}`;
    return NextResponse.redirect(redirect);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save installation' }, { status: 500 });
  }
}


