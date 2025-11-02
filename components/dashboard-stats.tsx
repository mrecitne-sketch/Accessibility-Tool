'use client';

import { Crown, Zap } from 'lucide-react';

interface DashboardStatsProps {
  user: {
    subscription_tier: 'free' | 'pro';
    scans_used_this_month: number;
  };
  scansCount: number;
}

export function DashboardStats({ user, scansCount }: DashboardStatsProps) {
  const isPro = user.subscription_tier === 'pro';
  const FREE_SCAN_LIMIT = 3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Subscription Tier Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Subscription
            </p>
            <div className="flex items-center space-x-2">
              {isPro ? (
                <>
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Pro
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Free
                </span>
              )}
            </div>
          </div>
          {isPro && (
            <div className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-semibold">
              Unlimited
            </div>
          )}
        </div>
      </div>

      {/* Scans This Month Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Scans This Month
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {user.scans_used_this_month}
            </span>
            {!isPro && (
              <span className="text-lg text-gray-500 dark:text-gray-400">
                / {FREE_SCAN_LIMIT}
              </span>
            )}
          </div>
          {isPro && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Unlimited scans included
            </p>
          )}
        </div>
      </div>

      {/* Total Scans Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Scans
          </p>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {scansCount}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            All time
          </p>
        </div>
      </div>
    </div>
  );
}

