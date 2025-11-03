import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 501 });
  }
  const redirectUri = `${appUrl}/api/github/oauth/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user`;
  return NextResponse.redirect(url);
}


