'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface CreatePrModalProps {
  open: boolean;
  onClose: () => void;
  scanId: string;
  selectedKeys: string[];
}

export function CreatePrModal({ open, onClose, scanId, selectedKeys }: CreatePrModalProps) {
  const [repo, setRepo] = useState('owner/repo');
  const [baseBranch, setBaseBranch] = useState('main');
  const [newBranch, setNewBranch] = useState(`allyfix/fixes-${scanId.slice(0, 8)}`);
  const [commitMessage, setCommitMessage] = useState('AllyFix: apply accessibility fixes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prUrl, setPrUrl] = useState<string | null>(null);

  if (!open) return null;

  const submit = async () => {
    setError(null); setPrUrl(null); setLoading(true);
    try {
      const r = await fetch('/api/github/create-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId, violationKeys: selectedKeys, repo, baseBranch, newBranch, commitMessage }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed to create PR');
      setPrUrl(j.prUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 mx-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold">Create GitHub PR</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <div className="text-gray-600 dark:text-gray-400">{selectedKeys.length} patch{selectedKeys.length===1?'':'es'} selected</div>
          <label className="block">
            <span className="block mb-1">Repository (owner/name)</span>
            <input value={repo} onChange={e=>setRepo(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block mb-1">Base branch</span>
              <input value={baseBranch} onChange={e=>setBaseBranch(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
            </label>
            <label className="block">
              <span className="block mb-1">New branch</span>
              <input value={newBranch} onChange={e=>setNewBranch(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
            </label>
          </div>
          <label className="block">
            <span className="block mb-1">Commit message</span>
            <input value={commitMessage} onChange={e=>setCommitMessage(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800" />
          </label>
          {error && <div className="text-red-600">{error}</div>}
          {prUrl && <div className="text-green-700">PR created: <a href={prUrl} className="underline" target="_blank" rel="noreferrer">{prUrl}</a></div>}
        </div>
        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button onClick={submit} disabled={loading} className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm disabled:opacity-60">
            {loading ? 'Creating…' : 'Create PR'}
          </button>
        </div>
      </div>
    </div>
  );
}


