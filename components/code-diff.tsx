'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeDiffProps {
  before: string;
  after: string;
  explanation?: string;
}

export function CodeDiff({ before, after, explanation }: CodeDiffProps) {
  const [copiedBefore, setCopiedBefore] = useState(false);
  const [copiedAfter, setCopiedAfter] = useState(false);

  const copyToClipboard = async (text: string, isBefore: boolean) => {
    await navigator.clipboard.writeText(text);
    if (isBefore) {
      setCopiedBefore(true);
      setTimeout(() => setCopiedBefore(false), 2000);
    } else {
      setCopiedAfter(true);
      setTimeout(() => setCopiedAfter(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {explanation && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{explanation}</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Before */}
        <div className="relative">
          <div className="flex items-center justify-between px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-t-lg border border-red-200 dark:border-red-800">
            <span className="text-sm font-semibold text-red-700 dark:text-red-300">Before</span>
            <button
              onClick={() => copyToClipboard(before, true)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
              aria-label="Copy before code"
            >
              {copiedBefore ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
          <pre className="p-4 bg-red-50/50 dark:bg-red-900/10 rounded-b-lg border border-red-200 dark:border-red-800 border-t-0 overflow-x-auto">
            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">{before}</code>
          </pre>
        </div>

        {/* After */}
        <div className="relative">
          <div className="flex items-center justify-between px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-t-lg border border-green-200 dark:border-green-800">
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">After</span>
            <button
              onClick={() => copyToClipboard(after, false)}
              className="p-1 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors"
              aria-label="Copy after code"
            >
              {copiedAfter ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
          <pre className="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-b-lg border border-green-200 dark:border-green-800 border-t-0 overflow-x-auto">
            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">{after}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

