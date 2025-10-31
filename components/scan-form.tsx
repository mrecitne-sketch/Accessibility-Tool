'use client';

import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';

interface ScanFormProps {
  onScan: (url: string) => void;
  isScanning?: boolean;
}

export function ScanForm({ onScan, isScanning = false }: ScanFormProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && !isScanning) {
      onScan(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          disabled={isScanning}
          required
        />
        <button
          type="submit"
          disabled={isScanning || !url}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Scan
            </>
          )}
        </button>
      </div>
    </form>
  );
}

