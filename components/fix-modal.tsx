'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import { CodeDiff } from './code-diff';

interface FixModalProps {
  open: boolean;
  onClose: () => void;
  scanId: string;
  violationKey: string; // `${violation.id}-${index}`
}

type TabKey = 'diff' | 'beforeAfter' | 'preview';

export function FixModal({ open, onClose, scanId, violationKey }: FixModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('diff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unifiedDiff, setUnifiedDiff] = useState('');
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [explanation, setExplanation] = useState('');
  const [copiedPatch, setCopiedPatch] = useState(false);
  const [copiedAfter, setCopiedAfter] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const resp = await fetch('/api/fix/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scanId, violationKey }),
        });
        if (!resp.ok) {
          throw new Error('Failed to load preview');
        }
        const json = await resp.json();
        if (!cancelled) {
          setUnifiedDiff(json.unifiedDiff || '');
          setBefore(json.before || '');
          setAfter(json.after || '');
          setExplanation(json.explanation || '');
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load preview');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [open, scanId, violationKey]);

  useEffect(() => {
    if (activeTab !== 'preview' || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    const html = `<!doctype html><html><head><meta charset="utf-8" /><style>body{font-family:system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial, sans-serif; padding:16px;} .box{border:1px solid #e5e7eb; border-radius:8px; padding:12px; background:#fafafa;}</style></head><body><div class="box">${after || ''}</div></body></html>`;
    doc.open();
    doc.write(html);
    doc.close();
  }, [activeTab, after]);

  const downloadFilename = useMemo(() => `allyfix-${violationKey}.diff`, [violationKey]);

  const handleDownload = () => {
    const blob = new Blob([unifiedDiff], { type: 'text/x-diff;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyPatch = async () => {
    await navigator.clipboard.writeText(unifiedDiff);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2000);
  };

  const handleCopyAfterSnippet = async () => {
    await navigator.clipboard.writeText(after);
    setCopiedAfter(true);
    setTimeout(() => setCopiedAfter(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 w-full max-w-5xl rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Fix Preview</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Violation: {violationKey}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'diff' ? 'bg-gray-900 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
            >
              Diff
            </button>
            <button
              onClick={() => setActiveTab('beforeAfter')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'beforeAfter' ? 'bg-gray-900 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
            >
              Before/After
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'preview' ? 'bg-gray-900 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
            >
              Preview
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={handleCopyPatch} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm">
                {copiedPatch ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} Copy .diff
              </button>
              <button onClick={handleDownload} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm">
                <Download className="w-4 h-4" /> Download .diff
              </button>
              <button onClick={handleCopyAfterSnippet} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm">
                {copiedAfter ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />} Copy After
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {loading && (
            <div className="text-sm text-gray-500">Loading…</div>
          )}
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          {!loading && !error && (
            <div>
              {activeTab === 'diff' && (
                <pre className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-x-auto text-sm text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-800 whitespace-pre-wrap">{unifiedDiff}</pre>
              )}
              {activeTab === 'beforeAfter' && (
                <CodeDiff before={before} after={after} explanation={explanation} />
              )}
              {activeTab === 'preview' && (
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                  <iframe ref={iframeRef} title="Fix Preview" className="w-full h-96" sandbox="allow-same-origin"></iframe>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


