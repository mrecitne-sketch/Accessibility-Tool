'use client';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ComplianceScoreProps {
  score: number;
  level: string;
}

export function ComplianceScore({ score, level }: ComplianceScoreProps) {
  const getScoreColor = () => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-32 h-32">
        <CircularProgressbar
          value={score}
          text={`${score}%`}
          styles={buildStyles({
            pathColor: getScoreColor(),
            textColor: getScoreColor(),
            textSize: '20px',
            trailColor: '#e5e7eb',
          })}
        />
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{level} Compliant</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">WCAG {level}</div>
      </div>
    </div>
  );
}

