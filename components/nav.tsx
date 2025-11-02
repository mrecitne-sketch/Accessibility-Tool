'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, User, ArrowRight, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AuthModal } from './auth-modal';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function Nav() {
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

  return (
    <>
      <nav className="bg-gray-950 border-b border-gray-400/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 relative">
            <Link href="/" className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-purple-500" />
              <span className="text-xl font-bold text-white">AccessibilityScore</span>
            </Link>
            
            {/* Centered Navigation Links */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
              <Link href="#features" className="text-white hover:text-gray-200 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-white hover:text-gray-200 transition-colors">
                Pricing
              </Link>
              <Link href="#faq" className="text-white hover:text-gray-200 transition-colors">
                FAQ
              </Link>
            </div>
            
            {/* Right Side - Login/Auth */}
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-white hover:text-gray-200 transition-colors flex items-center space-x-2"
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
                      className="flex items-center space-x-2 bg-transparent border border-gray-400 text-white px-4 py-2 rounded-md hover:border-gray-300 transition-colors font-medium"
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

