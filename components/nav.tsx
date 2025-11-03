'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, User, ArrowRight, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AuthModal } from './auth-modal';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface NavProps {
  variant?: 'default' | 'light' | 'transparent';
}

export function Nav({ variant = 'default' }: NavProps = {}) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  // Determine nav styling based on variant
  const getNavStyles = () => {
    switch (variant) {
      case 'light':
        // Match the scan results page background exactly
        return 'bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700';
      case 'transparent':
        return 'bg-transparent border-b border-gray-200/50 dark:border-gray-700/50';
      default:
        return 'bg-gray-950 border-b border-gray-400/30';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'light':
        return 'text-gray-900 dark:text-white';
      case 'transparent':
        return 'text-gray-900 dark:text-white';
      default:
        return 'text-white';
    }
  };

  const getHoverStyles = () => {
    switch (variant) {
      case 'light':
        return 'hover:text-gray-700 dark:hover:text-gray-300';
      case 'transparent':
        return 'hover:text-gray-700 dark:hover:text-gray-300';
      default:
        return 'hover:text-gray-200';
    }
  };

  const getLogoColor = () => {
    switch (variant) {
      case 'light':
      case 'transparent':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-purple-500';
    }
  };

  return (
    <>
      <nav className={getNavStyles()}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 relative">
            <Link href="/" className="flex items-center space-x-2">
              <Activity className={`w-6 h-6 ${getLogoColor()}`} />
              <span className={`text-xl font-bold ${getTextStyles()}`}>AccessibilityScore</span>
            </Link>
            
            {/* Centered Navigation Links */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
              <Link href="#features" className={`${getTextStyles()} ${getHoverStyles()} transition-colors`}>
                Features
              </Link>
              <Link href="#pricing" className={`${getTextStyles()} ${getHoverStyles()} transition-colors`}>
                Pricing
              </Link>
              <Link href="#faq" className={`${getTextStyles()} ${getHoverStyles()} transition-colors`}>
                FAQ
              </Link>
            </div>
            
            {/* Right Side - Login/Auth */}
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`${getTextStyles()} ${getHoverStyles()} transition-colors flex items-center space-x-2`}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className={`${getTextStyles()} ${getHoverStyles()} transition-colors`}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className={`${getTextStyles()} ${getHoverStyles()} transition-colors flex items-center space-x-2`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  {!loading && (
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className={`flex items-center space-x-2 bg-transparent border ${
                        variant === 'default' 
                          ? 'border-gray-400 text-white hover:border-gray-300' 
                          : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
                      } px-4 py-2 rounded-md transition-colors font-medium`}
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}

