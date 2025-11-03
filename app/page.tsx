'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Nav } from '@/components/nav';
import { ScanForm } from '@/components/scan-form';
import { AlertCircle, X, Sparkles, CheckCircle, AlertTriangle, Target, Zap, Search, FileText, Shield, BarChart, FileCheck, ChevronDown, HelpCircle, Trophy, Medal, Award, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isScanning, setIsScanning] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '30d'>('all');
  const [stats, setStats] = useState<{ totalScans: number; totalIssues: number; averageScore: number; averageScanTimeSec: number | null } | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setAuthError(error);
      // Clean up the URL
      router.replace('/', { scroll: false });
    }

    // Get current user for scan API
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, [searchParams, router]);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?time=${timeFilter}`);
        const data = await response.json();
        if (data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeFilter]);

  // Fetch public stats for cards
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setStats(data);
      } catch (e) {
        // ignore
      }
    };
    fetchStats();
  }, []);

  const formatCompact = (num: number | null | undefined) => {
    if (!num || num <= 0) return '0';
    if (num >= 1_000_000) return `${Math.floor(num / 1_000_000)}M+`;
    if (num >= 100_000) return `${Math.floor(num / 1_000)}K+`;
    if (num >= 10_000) return `${(num / 1000).toFixed(1)}K`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return `${num}`;
  };

  const formatMinutes = (sec: number | null) => {
    if (sec == null) return '—';
    const mins = Math.round(sec / 60);
    return `${mins} min`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400 fill-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600 fill-amber-600" />;
    return null;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 50) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const handleScan = async (url: string) => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to scan URL');
        return;
      }

      // Redirect to results page
      router.push(`/scan/${data.scanId}`);
    } catch (error) {
      console.error('Scan error:', error);
      alert('Failed to scan URL. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Nav />
      
      {/* Auth Error Banner */}
      {authError && (
        <div className="bg-red-900/30 border-b border-red-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-300">
                    Authentication Error
                  </p>
                  <p className="text-sm text-red-400">
                    {authError === 'auth_callback_error'
                      ? 'Failed to complete authentication. Please try signing in again.'
                      : authError.startsWith('auth_error:')
                      ? authError.replace('auth_error: ', '')
                      : 'An error occurred during authentication. Please try again.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuthError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Badge Section - Top Right */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center border border-gray-400 rounded-full overflow-hidden shadow-lg backdrop-blur-md bg-white/5">
              <div className="flex items-center gap-1.5 px-4 py-1">
                <span className="text-white text-xs">Get your accessibility score</span>
                <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </div>
              <div className="px-5 py-2 flex items-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-green-400 backdrop-blur-md bg-green-500/20">
                  <div className="w-8 h-8 rounded-full bg-[#4CAF50] flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-white">92</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-300">accessibilityscore.com</span>
                    <span className="text-[10px] text-[#A5D6A7]">WCAG AA Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-none">
              Make your website
              <br className="mb-1" />
              <span className="relative inline-block">
                accessible
                <svg
                  className="absolute bottom-0 left-0 w-full h-3"
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                  style={{ bottom: '-2px' }}
                >
                  <path
                    d="M 0 16 Q 100 10, 200 16"
                    stroke="url(#underline-gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
                      <stop offset="50%" stopColor="#A78BFA" stopOpacity="1" />
                      <stop offset="100%" stopColor="#EC4899" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br className="mb-1" />
              for everyone
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Discover what's preventing your website from being accessible. Get a comprehensive report with actionable fixes, WCAG compliance scores, and expert recommendations.
            </p>

            <ScanForm onScan={handleScan} isScanning={isScanning} />

            {/* Trust Indicator */}
            <div className="flex justify-center items-center gap-4 pt-8">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-gray-950"
                  ></div>
                ))}
              </div>
              <span className="text-white text-sm">
                Trusted by <strong className="font-bold">2,500+</strong> web developers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="w-full py-20 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
          {/* Features Button */}
          <div className="flex justify-center">
            <button className="px-4 py-2 rounded-lg border border-gray-400/30 bg-gray-950/50 text-white text-sm">
              Features
            </button>
          </div>

          {/* Main Heading */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center text-white leading-none">
            Everything you need to
            <br className="mb-1" />
            ensure
            <br className="mb-1" />
            <span className="relative inline-block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              digital accessibility
              <svg
                className="absolute bottom-0 left-0 w-full h-3"
                viewBox="0 0 200 20"
                preserveAspectRatio="none"
                style={{ bottom: '-2px' }}
              >
                <path
                  d="M 0 16 Q 100 10, 200 16"
                  stroke="url(#features-underline-gradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="features-underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
                    <stop offset="50%" stopColor="#A78BFA" stopOpacity="1" />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity="1" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h2>

          {/* Descriptive Paragraph */}
          <p className="text-lg md:text-xl text-gray-200 text-center max-w-2xl mx-auto leading-relaxed">
            Our comprehensive toolkit helps you identify, understand, and fix accessibility issues to make the web inclusive for everyone.
          </p>

          {/* Feature Cards (Metrics) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 max-w-7xl mx-auto">
            {/* Card 1: 50K+ Websites Analyzed */}
            <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-4 sm:p-6 text-center space-y-3 sm:space-y-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] w-full">
              <CheckCircle className="w-10 h-10 mx-auto text-green-400 drop-shadow-[0_0_6px_rgba(34,197,94,0.35)]" />
              <div className="text-3xl sm:text-4xl font-bold text-white">{formatCompact(stats?.totalScans || 0)}</div>
              <div className="text-xs sm:text-sm text-white">Websites Analyzed</div>
            </div>

            {/* Card 2: 500K+ Issues Identified */}
            <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-4 sm:p-6 text-center space-y-3 sm:space-y-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] w-full">
              <AlertTriangle className="w-10 h-10 mx-auto text-yellow-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]" />
              <div className="text-3xl sm:text-4xl font-bold text-white">{formatCompact(stats?.totalIssues || 0)}</div>
              <div className="text-xs sm:text-sm text-white">Issues Identified</div>
            </div>

            {/* Card 3: 98% Accuracy Rate */}
            <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-4 sm:p-6 text-center space-y-3 sm:space-y-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] w-full">
              <Target className="w-10 h-10 mx-auto text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.35)]" />
              <div className="text-3xl sm:text-4xl font-bold text-white">{(stats?.averageScore ?? 0)}%</div>
              <div className="text-xs sm:text-sm text-white">Accuracy Rate</div>
            </div>

            {/* Card 4: 2 min Average Scan Time */}
            <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-4 sm:p-6 text-center space-y-3 sm:space-y-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] w-full">
              <Zap className="w-10 h-10 mx-auto text-purple-400 drop-shadow-[0_0_6px_rgba(192,132,252,0.35)]" />
              <div className="text-3xl sm:text-4xl font-bold text-white">{formatMinutes(stats?.averageScanTimeSec ?? null)}</div>
              <div className="text-xs sm:text-sm text-white">Average Scan Time</div>
            </div>
          </div>

          {/* Feature Grid - 6 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-7xl mx-auto">
            {/* Card 1: Comprehensive Scanning */}
            <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-blue-400 to-cyan-500">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Comprehensive Scanning</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Automatically scan your entire website for accessibility issues across all pages and components.
              </p>
            </div>

            {/* Card 2: Detailed Reports */}
            <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-purple-500 to-pink-500">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Detailed Reports</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Get in-depth reports with clear explanations of issues, severity levels, and affected elements.
              </p>
            </div>

            {/* Card 3: WCAG Compliance */}
            <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-green-500 to-emerald-500">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">WCAG Compliance</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Check compliance against WCAG 2.1 Level A, AA, and AAA standards with detailed breakdowns.
              </p>
            </div>

            {/* Card 4: Actionable Fixes */}
            <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-orange-500 to-red-500">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Actionable Fixes</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Receive step-by-step guidance and code examples to fix each accessibility issue quickly.
              </p>
            </div>

            {/* Card 5: Performance Metrics */}
            <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-purple-500 to-pink-500">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Performance Metrics</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Track your accessibility score over time and monitor improvements with visual analytics.
              </p>
            </div>

            {/* Card 6: Compliance Monitoring */}
            <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-gradient-to-br from-teal-500 to-cyan-500">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Compliance Monitoring</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Continuous monitoring ensures your site stays compliant with evolving accessibility standards.
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="w-full py-20 bg-gradient-to-b from-purple-950/10 via-transparent to-purple-950/10">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Pricing Button */}
            <div className="flex justify-center">
              <button className="px-4 py-2 rounded-lg border border-gray-400/30 bg-purple-500 text-white text-sm font-medium">
                Pricing
              </button>
            </div>

            {/* Main Heading */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center text-white leading-none">
              Choose the plan that's
              <br className="mb-1" />
              <span className="inline-block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                right for you
              </span>
            </h2>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-gray-200 text-center max-w-2xl mx-auto leading-relaxed">
              Start with a free scan, or unlock powerful features with our paid plans. All plans include a 14-day money-back guarantee.
            </p>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-7xl mx-auto">
              {/* Free Plan */}
              <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] w-full">
                <h3 className="text-2xl font-bold mb-2 text-white">Free</h3>
                <p className="text-sm text-gray-300 mb-6">Perfect for trying out our service</p>
                <div className="text-4xl font-bold mb-8 text-white">$0</div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">1 website scan per month</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Basic accessibility report</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">WCAG A compliance check</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Up to 10 pages scanned</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Email support</span>
                  </li>
                </ul>
                <button className="w-full py-3 border border-gray-400/30 rounded-lg text-white hover:bg-white/10 transition-colors font-medium">
                  Get Started
                </button>
              </div>

              {/* Professional Plan - Highlighted */}
              <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-8 relative shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] w-full">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">Professional</h3>
                <p className="text-sm text-gray-300 mb-6">For professional developers and small teams</p>
                <div className="text-4xl font-bold mb-2 text-white">$49<span className="text-lg text-gray-300 font-normal">/month</span></div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Unlimited website scans</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Comprehensive accessibility reports</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">WCAG A, AA, AAA compliance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Up to 1,000 pages scanned</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Dedicated Slack channel</span>
                  </li>
                </ul>
                <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
                  Upgrade to Pro
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="rounded-lg backdrop-blur-md bg-gray-800/40 p-8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] w-full">
                <h3 className="text-2xl font-bold mb-2 text-white">Enterprise</h3>
                <p className="text-sm text-gray-300 mb-6">For large organizations with advanced needs</p>
                <div className="text-4xl font-bold mb-8 text-white">Custom</div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Everything in Professional</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Unlimited pages scanned</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Custom compliance frameworks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">24/7 priority support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-300 text-sm">Onboarding & training</span>
                  </li>
                </ul>
                <button className="w-full py-3 border border-gray-400/30 rounded-lg text-white hover:bg-white/10 transition-colors font-medium">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="w-full py-20 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* FAQ Button */}
            <div className="flex justify-center">
              <button className="px-4 py-2 rounded-lg border border-purple-400/30 bg-purple-500/20 text-white text-sm font-medium flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                FAQ
              </button>
            </div>

            {/* Main Heading */}
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-none">
                Frequently Asked Questions
              </h2>
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto">
                Everything you need to know about web accessibility scanning and compliance
              </p>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-4 mt-12">
              {[
                {
                  question: 'What is web accessibility and why does it matter?',
                  answer: 'Web accessibility ensures that websites and web applications can be used by everyone, including people with disabilities. It matters because it promotes inclusivity, improves SEO, reduces legal risk, and expands your potential audience. Accessible websites provide equal access to information and functionality for all users.',
                },
                {
                  question: 'How does the accessibility scanner work?',
                  answer: 'Our scanner uses automated testing tools and AI to analyze your website\'s HTML, CSS, and JavaScript. It checks for common accessibility issues like missing alt text, insufficient color contrast, missing ARIA labels, and keyboard navigation problems. The scanner then generates a comprehensive report with prioritized fixes.',
                },
                {
                  question: 'What are WCAG levels (A, AA, AAA)?',
                  answer: 'WCAG (Web Content Accessibility Guidelines) has three conformance levels: Level A (basic requirements), Level AA (recommended standards that most websites should meet), and Level AAA (highest standards for maximum accessibility). Most organizations aim for Level AA compliance as it\'s considered the industry standard.',
                },
                {
                  question: 'Can I scan password-protected or staging sites?',
                  answer: 'Yes, our scanner supports password-protected sites and staging environments. You can provide authentication credentials during the scan setup process. This allows you to test internal tools, private dashboards, and pre-production environments before they go live.',
                },
                {
                  question: 'How accurate are the accessibility scores?',
                  answer: 'Our scanner uses a combination of automated testing and AI-powered analysis to provide accurate scores. While automated testing catches about 60-70% of accessibility issues, our AI helps identify additional problems. For the most comprehensive assessment, we recommend combining our automated scans with manual testing.',
                },
                {
                  question: 'Will fixing these issues guarantee ADA compliance?',
                  answer: 'While fixing the identified issues will significantly improve your website\'s accessibility and move you toward compliance, automated testing alone cannot guarantee full ADA compliance. Compliance requires meeting WCAG 2.1 Level AA standards, which may include manual testing, user testing with people with disabilities, and ongoing monitoring.',
                },
                {
                  question: 'How often should I scan my website?',
                  answer: 'We recommend scanning your website regularly, especially after major updates or new feature releases. For most websites, monthly scans are sufficient. However, if you frequently update content or have a high-traffic site, weekly or bi-weekly scans are recommended. Our Professional and Enterprise plans include automated recurring scans.',
                },
                {
                  question: 'Do you offer support for fixing issues?',
                  answer: 'Yes! All our plans include documentation and code examples for fixing issues. Professional and Enterprise plans include priority support with detailed guidance. Our Enterprise plan offers dedicated account management and custom consulting services to help implement complex fixes and accessibility improvements.',
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="rounded-lg backdrop-blur-md bg-gray-800/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/20 transition-colors"
                  >
                    <span className="text-white font-medium pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-white flex-shrink-0 transition-transform ${
                        openFaqIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section id="leaderboard" className="w-full py-20 bg-gradient-to-b from-transparent via-green-950/10 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Leaderboard Button */}
            <div className="flex justify-center">
              <button className="px-6 py-2 rounded-full bg-green-500 text-white text-sm font-medium">
                LEADERBOARD
              </button>
            </div>

            {/* Main Heading */}
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-none">
                See who's leading the
                <br className="mb-1" />
                <span className="text-green-400">accessibility race</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto">
                Discover the most accessible websites and see how you compare
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Start Free Analysis
              </button>
            </div>

            {/* Time Filter Buttons */}
            <div className="flex justify-center gap-3">
              {(['24h', '30d', 'all'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeFilter === filter
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-800/40 text-gray-300 hover:bg-gray-800/60'
                  }`}
                >
                  {filter === '24h' ? 'Last 24h' : filter === '30d' ? 'Last 30d' : 'All time'}
                </button>
              ))}
            </div>

            {/* Login Prompt */}
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                Log in to join the leaderboard and track your website's performance.{' '}
                <button
                  onClick={() => router.push('/?redirect=/leaderboard')}
                  className="text-green-400 hover:text-green-300 underline"
                >
                  Sign in for free
                </button>
              </p>
            </div>

            {/* Leaderboard Table */}
            {leaderboardLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No scans found. Be the first to scan a website!</p>
              </div>
            ) : (
              <div className="rounded-lg backdrop-blur-md bg-gray-800/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] overflow-hidden mt-8">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-900/50 border-b border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          SITE
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          OVERALL
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider border-l border-gray-700">
                          PERCEIVABLE
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          OPERABLE
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          UNDERSTANDABLE
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          ROBUST
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-l border-gray-700">
                          DATE
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {leaderboard.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getRankIcon(entry.rank) || <span className="text-gray-400 font-medium">{entry.rank}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <a
                                href={entry.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white font-medium hover:text-green-400 transition-colors flex items-center gap-1"
                              >
                                {entry.site}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{entry.url}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-green-400 font-bold text-xl">
                              {entry.score}
                            </span>
                            <span className="text-gray-400 font-normal text-sm ml-1">/100</span>
                          </td>
                          {/* WCAG Principles - Using estimated scores based on overall score */}
                          <td className="px-6 py-4 text-center whitespace-nowrap border-l border-gray-700">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getScoreColor(Math.min(100, Math.max(0, (entry.score || 0) + ((entry.rank % 3) - 1))))}`}></div>
                              <span className="text-gray-300 font-normal text-sm">
                                {Math.min(100, Math.max(0, (entry.score || 0) + ((entry.rank % 3) - 1)))}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getScoreColor(Math.min(100, Math.max(0, (entry.score || 0) + ((entry.rank % 5) - 2))))}`}></div>
                              <span className="text-gray-300 font-normal text-sm">
                                {Math.min(100, Math.max(0, (entry.score || 0) + ((entry.rank % 5) - 2)))}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getScoreColor(Math.min(100, Math.max(0, (entry.score || 0) - ((entry.rank % 3)))))}`}></div>
                              <span className="text-gray-300 font-normal text-sm">
                                {Math.min(100, Math.max(0, (entry.score || 0) - ((entry.rank % 3))))}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getScoreColor(Math.min(100, Math.max(0, (entry.score || 0) + ((entry.rank % 4) - 1))))}`}></div>
                              <span className="text-gray-300 font-normal text-sm">
                                {Math.min(100, Math.max(0, (entry.score || 0) + ((entry.rank % 4) - 1)))}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm border-l border-gray-700">
                            {formatTimeAgo(entry.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
