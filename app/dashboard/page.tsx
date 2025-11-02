import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Nav } from '@/components/nav';
import { DashboardStats } from '@/components/dashboard-stats';
import { RecentScans } from '@/components/recent-scans';
import { UsageCard } from '@/components/usage-card';
import { QuickActions } from '@/components/quick-actions';
import { SubscriptionCard } from '@/components/subscription-card';
import { DashboardRefresh } from '@/components/dashboard-refresh';
import Link from 'next/link';
import { Scan } from 'lucide-react';

export const revalidate = 0; // Disable caching for this page
export const dynamic = 'force-dynamic'; // Always fetch fresh data

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/?redirect=/dashboard');
  }

  // Get user data from database
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    // User might not exist in database yet - try to upsert them
    // Using upsert instead of insert to handle potential race conditions
    const { data: upsertData, error: upsertError } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email || '',
          subscription_tier: 'free',
          scans_used_this_month: 0,
        },
        {
          onConflict: 'id',
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting user:', upsertError);
      // If upsert fails due to RLS, we'll show an error message
      // The user might need to contact support or there's a permissions issue
    }

    // Retry fetching user data (or use the upsert result if successful)
    let retryData = upsertData;
    if (!retryData) {
      const { data: fetchedData, error: retryError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      retryData = fetchedData;
    }

    if (!retryData) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
          <Nav />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">
                Error Loading Dashboard
              </h1>
              <p className="text-gray-300 mb-4">
                {retryError?.code === 'PGRST116'
                  ? 'Your account is being set up. Please refresh the page in a moment.'
                  : retryError?.message || upsertError?.message
                  ? `Unable to create user account: ${retryError?.message || upsertError?.message}. Please contact support.`
                  : 'Unable to load your account. Please try refreshing the page or contact support if the issue persists.'}
              </p>
              <p className="text-sm text-gray-400">
                Error details: {JSON.stringify(retryError || upsertError)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Use retry data
    const { data: scans } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <Nav />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <DashboardStats
              user={retryData}
              scansCount={scans?.length || 0}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <QuickActions subscriptionTier={retryData.subscription_tier} />
                <RecentScans scans={scans || []} />
              </div>
              <div className="space-y-6">
                <UsageCard
                  subscriptionTier={retryData.subscription_tier}
                  scansUsed={retryData.scans_used_this_month}
                />
                <SubscriptionCard
                  subscriptionTier={retryData.subscription_tier}
                  userId={user.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get user's recent scans
  const { data: scans, error: scansError } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <DashboardRefresh />
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Dashboard
              </h1>
              <p className="text-gray-300 mt-1">
                Welcome back, {user.email}
              </p>
            </div>
          </div>

          {/* Stats Overview */}
          <DashboardStats
            user={userData}
            scansCount={scans?.length || 0}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <QuickActions subscriptionTier={userData.subscription_tier} />
              <RecentScans scans={scans || []} />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <UsageCard
                subscriptionTier={userData.subscription_tier}
                scansUsed={userData.scans_used_this_month}
              />
              <SubscriptionCard
                subscriptionTier={userData.subscription_tier}
                userId={user.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

