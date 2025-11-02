'use client';

import Link from 'next/link';
import { Scan, ArrowRight, Crown } from 'lucide-react';
import { useState } from 'react';

interface QuickActionsProps {
  subscriptionTier: 'free' | 'pro';
}

export function QuickActions({ subscriptionTier }: QuickActionsProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please sign in to upgrade');
        return;
      }

      // Call checkout API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade process');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsManaging(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please sign in');
        return;
      }

      // Call portal API
      const response = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
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
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h2>
      <div className="space-y-3">
        {/* New Scan Button - Primary Action */}
        <Link
          href="/"
          className="flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Scan className="w-5 h-5" />
            <span>New Scan</span>
          </div>
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Upgrade or Manage Subscription */}
        {subscriptionTier === 'free' ? (
          <button
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="flex items-center justify-between w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <Crown className="w-5 h-5" />
              <span>{isUpgrading ? 'Loading...' : 'Upgrade to Pro'}</span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleManageSubscription}
            disabled={isManaging}
            className="flex items-center justify-between w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <Crown className="w-5 h-5" />
              <span>
                {isManaging ? 'Loading...' : 'Manage Subscription'}
              </span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

