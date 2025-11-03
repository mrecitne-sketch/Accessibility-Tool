'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Nav } from '@/components/nav';
import { ComplianceScore } from '@/components/compliance-score';
import { CodeDiff } from '@/components/code-diff';
import { ChevronDown, ChevronUp, Download, Share2, ArrowLeft, Calendar, XCircle, AlertTriangle, Info } from 'lucide-react';
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
  const router = useRouter();
  const scanId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedViolations, setExpandedViolations] = useState<Set<string>>(new Set());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

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

  const toggleViolation = (violationId: string) => {
    const newExpanded = new Set(expandedViolations);
    if (newExpanded.has(violationId)) {
      newExpanded.delete(violationId);
    } else {
      newExpanded.add(violationId);
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

  const handleShare = async () => {
    if (!data) return;
    
    const shareUrl = window.location.href;
    const shareData = {
      title: `Accessibility Analysis Report - ${data.url}`,
      text: `Check out this accessibility analysis report for ${data.url}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusText = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Needs Improvement';
    return 'Poor';
  };

  // Extract WCAG guideline info from violation
  const getWCAGGuideline = (violation: Violation & { fix?: any }) => {
    const wcagMap: Record<string, { guideline: string; level: string; principle: string }> = {
      'image-alt': { guideline: '1.1.1 Non-text Content', level: 'Level A', principle: 'Perceivable' },
      'color-contrast': { guideline: '1.4.3 Contrast (Minimum)', level: 'Level AA', principle: 'Perceivable' },
      'label': { guideline: '1.3.1 Info and Relationships', level: 'Level A', principle: 'Perceivable' },
      'label-name': { guideline: '1.3.1 Info and Relationships', level: 'Level A', principle: 'Perceivable' },
      'input-label': { guideline: '1.3.1 Info and Relationships', level: 'Level A', principle: 'Perceivable' },
      'link-name': { guideline: '2.4.4 Link Purpose (In Context)', level: 'Level A', principle: 'Operable' },
      'button-name': { guideline: '4.1.2 Name, Role, Value', level: 'Level A', principle: 'Robust' },
      'heading-order': { guideline: '1.3.1 Info and Relationships', level: 'Level A', principle: 'Perceivable' },
    };

    // Check for exact match
    if (wcagMap[violation.id]) {
      return wcagMap[violation.id];
    }

    // Try to extract from helpUrl
    if (violation.helpUrl) {
      const urlMatch = violation.helpUrl.match(/\/([\d.]+)/);
      if (urlMatch) {
        const guidelineNum = urlMatch[1];
        // Map common guideline numbers
        const guidelineNames: Record<string, { guideline: string; level: string; principle: string }> = {
          '1.1.1': { guideline: '1.1.1 Non-text Content', level: 'Level A', principle: 'Perceivable' },
          '1.4.3': { guideline: '1.4.3 Contrast (Minimum)', level: 'Level AA', principle: 'Perceivable' },
          '1.3.1': { guideline: '1.3.1 Info and Relationships', level: 'Level A', principle: 'Perceivable' },
          '2.4.4': { guideline: '2.4.4 Link Purpose (In Context)', level: 'Level A', principle: 'Operable' },
          '4.1.2': { guideline: '4.1.2 Name, Role, Value', level: 'Level A', principle: 'Robust' },
        };
        if (guidelineNames[guidelineNum]) {
          return guidelineNames[guidelineNum];
        }
      }
    }

    // Default fallback
    return { guideline: 'WCAG Guideline', level: 'Level A', principle: 'Accessibility' };
  };

  // Get human-readable title from violation ID
  const getViolationTitle = (violation: Violation) => {
    const titleMap: Record<string, string> = {
      'image-alt': 'Missing alt text on images',
      'color-contrast': 'Insufficient color contrast',
      'label': 'Form inputs missing labels',
      'label-name': 'Form inputs missing labels',
      'input-label': 'Form inputs missing labels',
      'link-name': 'Links missing descriptive text',
      'button-name': 'Buttons missing accessible names',
      'heading-order': 'Improper heading hierarchy',
    };

    if (titleMap[violation.id]) {
      return titleMap[violation.id];
    }

    // Fallback to capitalized ID
    return violation.id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Nav variant="light" />
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
        <Nav variant="light" />
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

  // Calculate WCAG principles scores (placeholder calculation based on overall score)
  // In a real implementation, these would be calculated from actual violation data
  const calculatePrincipleScore = (baseScore: number, variation: number = 0) => {
    return Math.max(0, Math.min(100, baseScore + variation));
  };

  const principleScores = {
    perceivable: calculatePrincipleScore(data.score || 0, -2),
    operable: calculatePrincipleScore(data.score || 0, -4),
    understandable: calculatePrincipleScore(data.score || 0, 9),
    robust: calculatePrincipleScore(data.score || 0, 12),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Nav variant="light" />
      <div className="container mx-auto px-4 py-8">
        {/* Top Navigation Bar */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              <span>{isGeneratingPDF ? 'Generating PDF...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>

        {/* Report Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-3">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Scanned on {formatDate(data.created_at)}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{data.url}</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">Accessibility Analysis Report</p>
        </div>

        {/* Main Content Area - Combined Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Score Section */}
            <div>
              <ComplianceScore 
                score={data.score || 0} 
                level={data.level || 'A'}
                status={getStatusText(data.score || 0)}
              />
            </div>

            {/* WCAG Principles Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">WCAG Principles</h2>
              <div className="space-y-5">
                {[
                  { name: 'Perceivable', score: principleScores.perceivable },
                  { name: 'Operable', score: principleScores.operable },
                  { name: 'Understandable', score: principleScores.understandable },
                  { name: 'Robust', score: principleScores.robust },
                ].map((principle) => {
                  // Color logic based on score
                  const getScoreColor = (score: number) => {
                    if (score >= 90) return 'text-green-600 dark:text-green-400';
                    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
                    if (score >= 50) return 'text-orange-600 dark:text-orange-400';
                    return 'text-red-600 dark:text-red-400';
                  };

                  const getProgressBarColor = (score: number) => {
                    if (score >= 90) return 'bg-green-500 dark:bg-green-400';
                    if (score >= 70) return 'bg-yellow-500 dark:bg-yellow-400';
                    if (score >= 50) return 'bg-orange-500 dark:bg-orange-400';
                    return 'bg-red-500 dark:bg-red-400';
                  };

                  return (
                    <div key={principle.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {principle.name}
                        </span>
                        <span className={`text-sm font-semibold ${getScoreColor(principle.score)}`}>
                          {principle.score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`${getProgressBarColor(principle.score)} h-2.5 rounded-full transition-all duration-300`}
                          style={{ width: `${principle.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Issue Summary - Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Critical Issues Card - Matching Code Diff Styling */}
          <div className="rounded-xl p-6 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="text-5xl font-bold mb-2 text-red-700 dark:text-red-300">
              {violationsByImpact.critical.length}
            </div>
            <div className="text-sm font-medium text-red-700 dark:text-red-300">
              Critical Issues
            </div>
          </div>

          {/* Serious Issues Card - Matching Code Diff Styling */}
          <div className="rounded-xl p-6 text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <div className="text-5xl font-bold mb-2 text-orange-700 dark:text-orange-300">
              {violationsByImpact.serious.length}
            </div>
            <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Serious Issues
            </div>
          </div>

          {/* Moderate Issues Card - Matching Code Diff Styling */}
          <div className="rounded-xl p-6 text-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="text-5xl font-bold mb-2 text-yellow-700 dark:text-yellow-300">
              {violationsByImpact.moderate.length}
            </div>
            <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Moderate Issues
            </div>
          </div>

          {/* Minor Issues Card - Matching Code Diff Styling */}
          <div className="rounded-xl p-6 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="text-5xl font-bold mb-2 text-blue-700 dark:text-blue-300">
              {violationsByImpact.minor.length}
            </div>
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Minor Issues
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        {data.violations_data && data.violations_data.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedFilter(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === null
                  ? 'bg-gray-800 text-white border border-gray-600'
                  : 'bg-gray-800/40 text-gray-300 hover:bg-gray-800/60 border border-gray-700'
              }`}
            >
              All ({data.violations_data.length})
            </button>
            <button
              onClick={() => setSelectedFilter('critical')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'critical'
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                  : 'bg-red-50/40 dark:bg-red-900/10 border border-red-200/40 dark:border-red-800/40 text-red-700/70 dark:text-red-300/70 hover:bg-red-50/60 dark:hover:bg-red-900/30'
              }`}
            >
              Critical ({violationsByImpact.critical.length})
            </button>
            <button
              onClick={() => setSelectedFilter('serious')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'serious'
                  ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
                  : 'bg-orange-50/40 dark:bg-orange-900/10 border border-orange-200/40 dark:border-orange-800/40 text-orange-700/70 dark:text-orange-300/70 hover:bg-orange-50/60 dark:hover:bg-orange-900/30'
              }`}
            >
              Serious ({violationsByImpact.serious.length})
            </button>
            <button
              onClick={() => setSelectedFilter('moderate')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'moderate'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
                  : 'bg-yellow-50/40 dark:bg-yellow-900/10 border border-yellow-200/40 dark:border-yellow-800/40 text-yellow-700/70 dark:text-yellow-300/70 hover:bg-yellow-50/60 dark:hover:bg-yellow-900/30'
              }`}
            >
              Moderate ({violationsByImpact.moderate.length})
            </button>
            <button
              onClick={() => setSelectedFilter('minor')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'minor'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                  : 'bg-blue-50/40 dark:bg-blue-900/10 border border-blue-200/40 dark:border-blue-800/40 text-blue-700/70 dark:text-blue-300/70 hover:bg-blue-50/60 dark:hover:bg-blue-900/30'
              }`}
            >
              Minor ({violationsByImpact.minor.length})
            </button>
          </div>
        )}

        {/* Issues List */}
        <div className="space-y-4">
          {data.violations_data
            ?.filter((violation) => !selectedFilter || violation.impact === selectedFilter)
            .map((violation, index) => {
            const wcagInfo = getWCAGGuideline(violation);
            const violationTitle = getViolationTitle(violation);
            const elementCount = violation.nodes?.length || 0;
            const isExpanded = expandedViolations.has(violation.id);
            
            // Create a unique key by combining index and violation id
            const uniqueKey = `${violation.id}-${index}`;
            
            return (
              <div
                key={uniqueKey}
                className="bg-gray-800 dark:bg-gray-800 rounded-xl shadow overflow-hidden"
              >
                <button
                  onClick={() => toggleViolation(violation.id)}
                  className="w-full p-6 hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* Top Row - Summary Line */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Severity Icon - Matching Code Diff Styling */}
                    {violation.impact === 'critical' ? (
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        {/* Circle X icon - outlined red matching border */}
                        <XCircle className="w-5 h-5 text-red-700 dark:text-red-300" fill="none" strokeWidth="2" />
                      </div>
                    ) : violation.impact === 'serious' ? (
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                        {/* Exclamation symbol - outlined orange matching border */}
                        <AlertTriangle className="w-4 h-4 text-orange-700 dark:text-orange-300" fill="none" strokeWidth="2" />
                      </div>
                    ) : violation.impact === 'moderate' ? (
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        {/* Exclamation symbol - outlined yellow matching border */}
                        <AlertTriangle className="w-4 h-4 text-yellow-700 dark:text-yellow-300" fill="none" strokeWidth="2" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        {/* Info symbol - outlined blue matching border */}
                        <Info className="w-4 h-4 text-blue-700 dark:text-blue-300" fill="none" strokeWidth="2" />
                      </div>
                    )}
                    
                    {/* Issue Title with Pills next to it */}
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-white font-semibold text-left">
                        {violationTitle}
                      </span>
                      
                      {/* Severity Tag - Matching Code Diff Styling */}
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                          violation.impact === 'critical' 
                            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' :
                          violation.impact === 'serious'
                            ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300' :
                          violation.impact === 'moderate'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300' :
                          'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {violation.impact}
                      </span>
                      
                      {/* Element Count Tag with Frosted Effect */}
                      <span 
                        className="px-3 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(75, 85, 99, 0.75)',
                          border: '1px solid rgba(156, 163, 175, 0.7)',
                          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 4px rgba(156, 163, 175, 0.15)',
                        }}
                      >
                        {elementCount} {elementCount === 1 ? 'element' : 'elements'}
                      </span>
                    </div>
                    
                    {/* Chevron - only show when collapsed */}
                    {!isExpanded && (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-auto" />
                    )}
                    {isExpanded && (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-auto" />
                    )}
                  </div>

                  {/* Second Row - Description */}
                  <div className="text-left pl-9 mb-2">
                    <p className="text-gray-400 dark:text-gray-400 text-sm">
                      {violation.description}
                    </p>
                  </div>

                  {/* Third Row - WCAG Guideline and Principle */}
                  <div className="text-left pl-9">
                    <span className="text-blue-400 dark:text-blue-400 text-sm">
                      {wcagInfo.guideline} ({wcagInfo.level})
                    </span>
                    <span className="text-gray-500 dark:text-gray-500 text-sm mx-2">•</span>
                    <span className="text-gray-400 dark:text-gray-400 text-sm">
                      {wcagInfo.principle}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-6 border-t border-gray-700 dark:border-gray-700 space-y-4 bg-gray-800 dark:bg-gray-800">
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
            );
          })}
        </div>

        {(!data.violations_data || data.violations_data.length === 0) && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Perfect!</h2>
            <p className="text-green-700 dark:text-green-300">No accessibility violations found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

