'use client';

interface UsageCardProps {
  subscriptionTier: 'free' | 'pro';
  scansUsed: number;
}

const FREE_SCAN_LIMIT = 3;

export function UsageCard({ subscriptionTier, scansUsed }: UsageCardProps) {
  const isPro = subscriptionTier === 'pro';
  const scansRemaining = isPro ? -1 : FREE_SCAN_LIMIT - scansUsed;
  const percentage = isPro ? 100 : (scansUsed / FREE_SCAN_LIMIT) * 100;
  const isNearLimit = !isPro && scansUsed >= FREE_SCAN_LIMIT - 1;
  const isAtLimit = !isPro && scansUsed >= FREE_SCAN_LIMIT;

  const getProgressColor = () => {
    if (isPro) return 'bg-green-500';
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getTextColor = () => {
    if (isPro) return 'text-green-600 dark:text-green-400';
    if (isAtLimit) return 'text-red-600 dark:text-red-400';
    if (isNearLimit) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Usage This Month
      </h2>

      {isPro ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Scans Used
            </span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              Unlimited
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{ width: '100%' }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Your Pro subscription includes unlimited scans
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Scans Remaining
            </span>
            <span
              className={`text-sm font-semibold ${
                isAtLimit
                  ? 'text-red-600 dark:text-red-400'
                  : isNearLimit
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {scansRemaining > 0
                ? `${scansRemaining} of ${FREE_SCAN_LIMIT}`
                : '0 remaining'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`${getProgressColor()} h-3 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Free tier includes {FREE_SCAN_LIMIT} scans per month
            {isAtLimit && (
              <span className="block mt-1 text-red-600 dark:text-red-400 font-medium">
                You've reached your monthly limit. Upgrade to Pro for unlimited scans.
              </span>
            )}
            {isNearLimit && !isAtLimit && (
              <span className="block mt-1 text-yellow-600 dark:text-yellow-400 font-medium">
                Only 1 scan remaining this month.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

