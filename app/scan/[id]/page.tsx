'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Nav } from '@/components/nav';
import { ComplianceScore } from '@/components/compliance-score';
import { CodeDiff } from '@/components/code-diff';

export default function ScanResultsPage() {
  const params = useParams();
  const scanId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // TODO: Fetch scan data by ID
    setLoading(false);
  }, [scanId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Nav />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading scan results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Scan Results</h1>
        {/* TODO: Add scan results UI */}
      </div>
    </div>
  );
}

