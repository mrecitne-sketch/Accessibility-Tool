'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Scan } from '@/types/scan';

interface ScanData extends Scan {
  violations_data?: any[] | null;
}

interface TrendsChartProps {
  scans: ScanData[];
}

type MetricType = 'overall' | 'perceivable' | 'operable' | 'understandable' | 'robust' | 'violations';

const calculatePrincipleScore = (baseScore: number, variation: number = 0) => {
  return Math.max(0, Math.min(100, baseScore + variation));
};

export function TrendsChart({ scans }: TrendsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('overall');
  const [metricDropdownOpen, setMetricDropdownOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string>('all');
  const [urlDropdownOpen, setUrlDropdownOpen] = useState(false);
  
  // Get unique URLs from scans
  const uniqueUrls = Array.from(new Set(scans.map(scan => scan.url)));
  
  // Filter scans by selected URL
  const filteredScans = selectedUrl === 'all' 
    ? scans 
    : scans.filter(scan => scan.url === selectedUrl);
  
  // Filter and prepare data for the chart
  const chartData = filteredScans
    .filter(scan => scan.score !== null) // Only include completed scans with scores
    .map(scan => {
      const baseScore = scan.score as number;
      // Calculate principle scores (same logic as in scan results page)
      const perceivable = calculatePrincipleScore(baseScore, -2);
      const operable = calculatePrincipleScore(baseScore, -4);
      const understandable = calculatePrincipleScore(baseScore, 9);
      const robust = calculatePrincipleScore(baseScore, 12);
      
      // Calculate violation count
      const violationsCount = scan.violations_data?.length || 0;
      
      return {
        date: new Date(scan.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        overall: baseScore,
        perceivable,
        operable,
        understandable,
        robust,
        violations: violationsCount,
        fullDate: scan.created_at,
      };
    })
    .reverse(); // Show oldest to newest

  // Calculate improvement for selected metric (only if we have data)
  const firstScore = chartData.length > 0 ? chartData[0][selectedMetric] : 0;
  const lastScore = chartData.length > 0 ? chartData[chartData.length - 1][selectedMetric] : 0;
  const improvement = chartData.length > 0 ? lastScore - firstScore : 0;
  const improvementPercentage = chartData.length > 0 ? ((improvement / firstScore) * 100).toFixed(1) : '0';

  const metricLabels: Record<MetricType, string> = {
    overall: 'Overall',
    perceivable: 'Perceivable',
    operable: 'Operable',
    understandable: 'Understandable',
    robust: 'Robust',
    violations: 'Violations',
  };

  const getMetricColor = (metric: MetricType) => {
    const colors: Record<MetricType, string> = {
      overall: '#3b82f6',
      perceivable: '#10b981',
      operable: '#f59e0b',
      understandable: '#8b5cf6',
      robust: '#ec4899',
      violations: '#ef4444',
    };
    return colors[metric] || '#3b82f6';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Score Trends
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Your accessibility score over time
            </p>
          </div>
          {improvement !== 0 && (
            <div className={`text-right ${improvement > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <div className="text-2xl font-bold">
                {improvement > 0 ? '+' : ''}{improvement}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {improvement > 0 ? '↑ Improvement' : '↓ Decline'}
              </div>
            </div>
          )}
        </div>
        
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3">
          {/* URL Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUrlDropdownOpen(!urlDropdownOpen)}
              className="flex items-center justify-between w-full md:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <span className="font-medium truncate max-w-[200px]">
                {selectedUrl === 'all' ? 'All Websites' : selectedUrl}
              </span>
              <ChevronDown className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${urlDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {urlDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setUrlDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-full md:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-[200px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedUrl('all');
                      setUrlDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg ${
                      selectedUrl === 'all' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <span className={`font-medium ${selectedUrl === 'all' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      All Websites
                    </span>
                  </button>
                  {uniqueUrls.map((url, index) => (
                    <button
                      key={url}
                      onClick={() => {
                        setSelectedUrl(url);
                        setUrlDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        selectedUrl === url ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      } ${index === uniqueUrls.length - 1 ? 'rounded-b-lg' : ''}`}
                    >
                      <span className={`font-medium truncate block ${selectedUrl === url ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {url}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Metric Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMetricDropdownOpen(!metricDropdownOpen)}
              className="flex items-center justify-between w-full md:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getMetricColor(selectedMetric) }}
                />
                <span className="font-medium">{metricLabels[selectedMetric]}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${metricDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {metricDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMetricDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-full md:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
                  {(['overall', 'perceivable', 'operable', 'understandable', 'robust', 'violations'] as MetricType[]).map((metric) => (
                    <button
                      key={metric}
                      onClick={() => {
                        setSelectedMetric(metric);
                        setMetricDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        selectedMetric === metric ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      } ${metric === 'overall' ? 'rounded-t-lg' : ''} ${metric === 'violations' ? 'rounded-b-lg' : ''}`}
                    >
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: getMetricColor(metric) }}
                      />
                      <span className={`font-medium ${selectedMetric === metric ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {metricLabels[metric]}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {chartData.length < 2 ? (
          <div className="flex items-center justify-center" style={{ height: 300 }}>
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {chartData.length === 0 
                  ? 'Complete at least 2 scans to see trends over time'
                  : 'Complete one more scan to see trends'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  domain={selectedMetric === 'violations' ? ['auto', 'auto'] : [0, 100]}
                  stroke="#6b7280"
                  tick={{ fill: '#6b7280' }}
                  label={{ value: selectedMetric === 'violations' ? 'Count' : 'Score', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value: number) => selectedMetric === 'violations' ? [value, 'Violations'] : [`${value}%`, 'Score']}
                />
                <Legend wrapperStyle={{ color: '#6b7280' }} />
                <Area 
                  type="monotone"
                  dataKey={selectedMetric} 
                  stroke={getMetricColor(selectedMetric)}
                  strokeWidth={2}
                  fill="url(#colorScore)"
                  dot={{ r: 4, fill: getMetricColor(selectedMetric) }}
                  activeDot={{ r: 6 }}
                  name={selectedMetric === 'violations' ? metricLabels[selectedMetric] + ' Count' : metricLabels[selectedMetric] + ' Score'}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Key Insights */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {chartData.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Scans
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${selectedMetric === 'violations' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {chartData.length > 0 ? Math.max(...chartData.map(d => d[selectedMetric])) : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedMetric === 'violations' ? 'Most Violations' : 'Best Score'}
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  selectedMetric === 'violations' 
                    ? 'text-red-600 dark:text-red-400' 
                    : improvement >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {lastScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedMetric === 'violations' ? 'Latest Count' : 'Latest Score'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

