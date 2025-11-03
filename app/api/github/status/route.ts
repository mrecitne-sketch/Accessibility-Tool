import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const configured = Boolean(process.env.GITHUB_APP_ID && process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  // Placeholder: user-linked state would come from DB/session. For now, report false.
  const linked = false;
  return NextResponse.json({ configured, linked });
}


