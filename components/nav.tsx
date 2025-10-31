'use client';

import Link from 'next/link';
import { Scan } from 'lucide-react';

export function Nav() {
  return (
    <nav className="border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Scan className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">AllyFix</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

