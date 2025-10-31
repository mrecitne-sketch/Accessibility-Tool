import { createAdminClient } from './supabase/server';
import { User } from '@/types/scan';

const FREE_SCAN_LIMIT = 3;

export async function checkQuota(userId: string): Promise<{
  canScan: boolean;
  scansRemaining: number;
  user: User | null;
}> {
  const supabase = await createAdminClient();
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return { canScan: false, scansRemaining: 0, user: null };
  }

  // Pro users have unlimited scans
  if (user.subscription_tier === 'pro') {
    return { canScan: true, scansRemaining: -1, user };
  }

  // Free users limited to 3 per month
  const scansRemaining = FREE_SCAN_LIMIT - user.scans_used_this_month;
  return {
    canScan: scansRemaining > 0,
    scansRemaining,
    user,
  };
}

export async function incrementScanCount(userId: string): Promise<void> {
  const supabase = await createAdminClient();
  
  // Get current count and increment
  const { data: user } = await supabase
    .from('users')
    .select('scans_used_this_month')
    .eq('id', userId)
    .single();

  if (user) {
    await supabase
      .from('users')
      .update({ scans_used_this_month: user.scans_used_this_month + 1 })
      .eq('id', userId);
  }
}

export async function resetMonthlyCounts(): Promise<void> {
  const supabase = await createAdminClient();
  
  await supabase.rpc('reset_monthly_scan_counts');
}

