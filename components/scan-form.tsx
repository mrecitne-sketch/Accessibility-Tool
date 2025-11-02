'use client';

import { useState } from 'react';
import { Loader2, Globe } from 'lucide-react';

interface ScanFormProps {
  onScan: (url: string) => void;
  isScanning?: boolean;
}

export function ScanForm({ onScan, isScanning = false }: ScanFormProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    if (!isScanning) {
      setError('');
      onScan(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            placeholder="website.com"
            className="w-full pl-12 pr-4 py-4 rounded-lg backdrop-blur-md bg-black/30 border border-gray-400 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            disabled={isScanning}
          />
          {error && (
            <p className="absolute top-full mt-1 text-sm text-red-400">{error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isScanning}
          className={`px-8 py-4 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold ${
            isScanning 
              ? 'bg-gradient-to-r from-gray-600 to-gray-700' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90'
          }`}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
              Analyzing...
            </>
          ) : (
            'Analyze'
          )}
        </button>
      </div>
    </form>
  );
}

