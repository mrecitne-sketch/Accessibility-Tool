'use client';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ComplianceScoreProps {
  score: number;
  level: string;
  status?: string;
}

export function ComplianceScore({ score, level, status }: ComplianceScoreProps) {
  const getScoreColor = () => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 70) return '#f59e0b'; // orange (matches image)
    return '#ef4444'; // red
  };

  const levelText = level === 'AAA' ? '2.1 Level AAA' : level === 'AA' ? '2.1 Level AA' : '2.1 Level A';

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-48 h-48 relative">
        <CircularProgressbar
          value={score}
          styles={buildStyles({
            pathColor: getScoreColor(),
            trailColor: '#374151',
            strokeWidth: 12,
          })}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-white dark:text-white">
            {score}
          </div>
          <div className="text-lg text-gray-400 dark:text-gray-400">
            / 100
          </div>
        </div>
      </div>
      <div className="text-center space-y-2">
        <div className="text-xl font-bold text-white dark:text-white">
          {status || (score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : score >= 70 ? 'Needs Improvement' : 'Poor')}
        </div>
        <div className="text-sm text-gray-400 dark:text-gray-400">
          WCAG {levelText}
        </div>
      </div>
    </div>
  );
}

