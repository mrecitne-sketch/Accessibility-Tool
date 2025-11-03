'use client';

import { useState } from 'react';
import { X, Download } from 'lucide-react';

interface ApplyLocallyDrawerProps {
  open: boolean;
  onClose: () => void;
  scanId: string;
  selectedKeys: string[]; // violation keys to include
}

export function ApplyLocallyDrawer({ open, onClose, scanId, selectedKeys }: ApplyLocallyDrawerProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleDownload = async () => {
    setError(null);
    setDownloading(true);
    try {
      const resp = await fetch('/api/fix/apply-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId, violationKeys: selectedKeys }),
      });
      if (!resp.ok) throw new Error('Failed to create archive');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `allyfix-patches-${scanId}.tar.gz`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Apply fixes locally</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Download a compressed archive of patch files and apply them in your repository using Git's three-way merge.
          </p>
          <div className="text-xs text-gray-600 dark:text-gray-400">{selectedKeys.length} patch{selectedKeys.length === 1 ? '' : 'es'} selected</div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <pre className="text-xs text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
{`git checkout -b allyfix/fixes-${scanId}
tar -xzf allyfix-patches-${scanId}.tar.gz
git apply --3way
git commit -m "AllyFix: apply accessibility fixes"`}
            </pre>
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400">
            Improve patch file paths by adding <code>data-source-path</code> attributes in your app. See <a href="/SOURCE_MAPPING_SETUP.md" className="underline">Source Mapping Setup</a>.
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
            disabled={downloading}
          >
            <Download className="w-4 h-4" /> {downloading ? 'Preparing…' : 'Download patches (.tar.gz)'}
          </button>
        </div>
      </div>
    </div>
  );
}


