import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    if (!code) return NextResponse.json({ error: 'code required' }, { status: 400 });

    const clientId = process.env.GITHUB_CLIENT_ID as string;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET as string;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'OAuth not configured' }, { status: 501 });
    }

    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    const tokenJson = await tokenResp.json();
    // In a full implementation we would store tokenJson.access_token linked to the current user

    return NextResponse.redirect(`${appUrl}?github_oauth=success`);
  } catch (e) {
    return NextResponse.json({ error: 'OAuth exchange failed' }, { status: 500 });
  }
}


