'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Client component that refreshes the dashboard when user returns from a scan
 * This ensures the dashboard shows the latest scans and updated usage counts
 */
export function DashboardRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Refresh dashboard data when component mounts
    // This happens when user navigates back to dashboard
    router.refresh();
  }, [router]);

  return null;
}

