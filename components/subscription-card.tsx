'use client';

import { Crown, Check } from 'lucide-react';
import { useState } from 'react';

interface SubscriptionCardProps {
  subscriptionTier: 'free' | 'pro';
  userId: string;
}

export function SubscriptionCard({
  subscriptionTier,
  userId,
}: SubscriptionCardProps) {
  const isPro = subscriptionTier === 'pro';
  const [isManaging, setIsManaging] = useState(false);

  const handleManageSubscription = async () => {
    setIsManaging(true);
    try {
      const response = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        alert('Failed to open subscription management');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert('Failed to open subscription management');
    } finally {
      setIsManaging(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Subscription
        </h2>
        {isPro && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
            <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
              Pro
            </span>
          </div>
        )}
      </div>

      {isPro ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Current Plan
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              Pro Plan
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              $15/month
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Pro Benefits:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Unlimited scans</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>PDF reports (coming soon)</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleManageSubscription}
            disabled={isManaging}
            className="w-full mt-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isManaging ? 'Loading...' : 'Manage Subscription'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Current Plan
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              Free Plan
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              3 scans per month
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Upgrade to Pro
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Get unlimited scans, priority support, and PDF reports for just
              $15/month.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

