'use client';

import { useEffect, useState } from 'react';

export function GithubConnectBanner() {
  const [status, setStatus] = useState<{ configured: boolean; linked: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/github/status');
        const j = await r.json();
        setStatus(j);
      } catch {
        setStatus({ configured: false, linked: false });
      }
    })();
  }, []);

  if (!status) return null;
  if (status.configured && status.linked) return null;

  return (
    <div className="mb-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-blue-800 dark:text-blue-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          {!status.configured ? (
            <span>GitHub integration is not configured. Set <code>GITHUB_APP_ID</code>, <code>GITHUB_CLIENT_ID</code>, and <code>GITHUB_CLIENT_SECRET</code> to enable PRs.</span>
          ) : (
            <span>Connect GitHub to enable one‑click PRs and source mapping automation.</span>
          )}
        </div>
        {status.configured && (
          <a
            href={process.env.NEXT_PUBLIC_GITHUB_APP_SLUG ? `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_SLUG}/installations/new` : '#'}
            className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs"
          >
            Connect GitHub
          </a>
        )}
      </div>
    </div>
  );
}


