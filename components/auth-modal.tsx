'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, mode = 'signin' }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentMode, setCurrentMode] = useState<'signin' | 'signup'>(mode);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    try {
      // For magic links, Supabase automatically signs up users by default
      // We'll allow automatic signup for both sign-in and sign-up modes
      // If signups are disabled, this will still work for existing users
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/dashboard')}`,
          // Omit shouldCreateUser to use default behavior (auto-signup if enabled)
          // This allows both new signups and existing user sign-ins
        },
      });

      if (error) {
        // If signups are disabled, provide helpful message
        if (error.message.includes('signups not allowed') || error.message.includes('Signups not allowed')) {
          setMessage({
            type: 'error',
            text: 'Sign ups are currently disabled. Please contact support or use an existing account to sign in.',
          });
        } else {
          setMessage({ type: 'error', text: error.message });
        }
      } else {
        setMessage({
          type: 'success',
          text: `Check your email! We've sent a ${currentMode === 'signup' ? 'sign up' : 'sign in'} link to ${email}`,
        });
        setEmail('');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setCurrentMode(currentMode === 'signin' ? 'signup' : 'signin');
    setMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentMode === 'signin' ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? 'Sending...'
              : currentMode === 'signin'
              ? 'Send Sign In Link'
              : 'Send Sign Up Link'}
          </button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {currentMode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

