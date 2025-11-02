'use client';

import Link from 'next/link';
import { ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Scan {
  id: string;
  url: string;
  status: 'pending' | 'completed' | 'failed';
  score: number | null;
  level: string | null;
  created_at: string;
}

interface RecentScansProps {
  scans: Scan[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-500';
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function getLevelBadgeColor(level: string | null): string {
  switch (level) {
    case 'AAA':
      return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
    case 'AA':
      return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
    case 'A':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
    case 'fail':
      return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  }
}

export function RecentScans({ scans }: RecentScansProps) {
  if (scans.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <ExternalLink className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No scans yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start your first accessibility scan to see results here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <span>Start Your First Scan</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Scans
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Your latest accessibility scan results
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {scans.map((scan) => (
              <tr
                key={scan.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                      {scan.url}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(scan.created_at)}
                </td>
                <td className="px-6 py-4">
                  {scan.score !== null ? (
                    <span
                      className={`text-sm font-semibold ${getScoreColor(scan.score)}`}
                    >
                      {scan.score}%
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {scan.level ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(scan.level)}`}
                    >
                      WCAG {scan.level}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {scan.status === 'completed' ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Completed
                      </span>
                    </div>
                  ) : scan.status === 'failed' ? (
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Failed
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Pending
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {scan.status === 'completed' ? (
                    <Link
                      href={`/scan/${scan.id}`}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Results
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {scans.map((scan) => (
          <div key={scan.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {scan.url}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(scan.created_at)}
                </p>
              </div>
              {scan.status === 'completed' && (
                <Link
                  href={`/scan/${scan.id}`}
                  className="ml-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex-shrink-0"
                >
                  View
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-3">
              {scan.score !== null && (
                <div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Score:
                  </span>
                  <span
                    className={`ml-1 text-sm font-semibold ${getScoreColor(scan.score)}`}
                  >
                    {scan.score}%
                  </span>
                </div>
              )}
              {scan.level && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLevelBadgeColor(scan.level)}`}
                >
                  WCAG {scan.level}
                </span>
              )}
              <div className="flex items-center space-x-1">
                {scan.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : scan.status === 'failed' ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                  {scan.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

