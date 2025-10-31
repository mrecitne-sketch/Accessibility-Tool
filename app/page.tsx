'use client';

import { Nav } from '@/components/nav';
import { ScanForm } from '@/components/scan-form';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Nav />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
            Make Your Website Accessible in Minutes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Scan any public URL, get WCAG compliance scores, and fix issues with exact code solutions.
          </p>
          <ScanForm onScan={() => {}} />
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Why Choose AllyFix?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Lightning Fast</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get compliance scores and fix suggestions in under 30 seconds
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🔧</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Exact Fixes</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get before/after code snippets you can copy-paste into your project
            </p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">WCAG Compliant</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Ensure your site meets WCAG A, AA, or AAA standards
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Simple, Transparent Pricing
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Free</h3>
            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-600 dark:text-gray-400">/month</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-400">3 scans per month</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-400">Basic compliance reports</span>
              </li>
            </ul>
            <button className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Get Started
            </button>
          </div>
          <div className="border-2 border-blue-500 rounded-lg p-8 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
              Popular
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Pro</h3>
            <div className="text-4xl font-bold mb-6">$15<span className="text-lg text-gray-600 dark:text-gray-400">/month</span></div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-400">Unlimited scans</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-400">Export PDF reports</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-600 dark:text-gray-400">Priority support</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
