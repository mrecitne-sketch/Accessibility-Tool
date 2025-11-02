'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Nav } from '@/components/nav';
import { ComplianceScore } from '@/components/compliance-score';
import { CodeDiff } from '@/components/code-diff';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Violation } from '@/types/scan';
import { PDFDocument } from '@/components/pdf-document';
import { pdf } from '@react-pdf/renderer';

interface ScanData {
  id: string;
  url: string;
  score: number;
  level: string;
  violations_data: (Violation & { fix: any })[];
  created_at: string;
}

export default function ScanResultsPage() {
  const params = useParams();
  const scanId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedViolations, setExpandedViolations] = useState<Set<number>>(new Set());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/scans/${scanId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch scan results');
        }
        const scanData = await response.json();
        setData(scanData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [scanId]);

  const toggleViolation = (index: number) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedViolations(newExpanded);
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500';
      case 'serious': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      case 'minor': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleExportPDF = async () => {
    if (!data) return;

    setIsGeneratingPDF(true);
    try {
      const doc = (
        <PDFDocument
          url={data.url}
          score={data.score || 0}
          level={data.level || 'A'}
          violations={data.violations_data || []}
          createdAt={data.created_at}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with URL and date
      const urlSlug = data.url
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '')
        .replace(/[^a-z0-9]/gi, '-')
        .substring(0, 50);
      const dateSlug = new Date(data.created_at).toISOString().split('T')[0];
      link.download = `allyfix-report-${urlSlug}-${dateSlug}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Nav />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading scan results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Nav />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 dark:text-gray-400">{error || 'Failed to load scan results'}</p>
          </div>
        </div>
      </div>
    );
  }

  const violationsByImpact = {
    critical: data.violations_data?.filter(v => v.impact === 'critical') || [],
    serious: data.violations_data?.filter(v => v.impact === 'serious') || [],
    moderate: data.violations_data?.filter(v => v.impact === 'moderate') || [],
    minor: data.violations_data?.filter(v => v.impact === 'minor') || [],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Scan Results</h1>
            <p className="text-gray-600 dark:text-gray-400">{data.url}</p>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            <span>{isGeneratingPDF ? 'Generating PDF...' : 'Export PDF'}</span>
          </button>
        </div>

        {/* Score Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-8">
          <ComplianceScore score={data.score || 0} level={data.level || 'A'} />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{violationsByImpact.critical.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{violationsByImpact.serious.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Serious</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{violationsByImpact.moderate.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Moderate</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{violationsByImpact.minor.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Minor</div>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {data.violations_data?.map((violation, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <button
                onClick={() => toggleViolation(index)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getImpactBadgeColor(violation.impact)}`}>
                    {violation.impact.toUpperCase()}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">{violation.id}</span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    ({violation.nodes?.length || 0} occurrences)
                  </span>
                </div>
                {expandedViolations.has(index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {expandedViolations.has(index) && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">{violation.description}</p>
                  
                  {violation.fix && (
                    <CodeDiff
                      before={violation.fix.before}
                      after={violation.fix.after}
                      explanation={violation.fix.explanation}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {(!data.violations_data || data.violations_data.length === 0) && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Perfect!</h2>
            <p className="text-green-700 dark:text-green-300">No accessibility violations found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

