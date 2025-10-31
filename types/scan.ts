export type SubscriptionTier = 'free' | 'pro';

export type ScanStatus = 'pending' | 'completed' | 'failed';

export type WCAGLevel = 'A' | 'AA' | 'AAA' | 'fail';

export type ViolationImpact = 'critical' | 'serious' | 'moderate' | 'minor';

export interface ViolationNode {
  target: string[];
  html: string;
  data?: Record<string, any>;
}

export interface Violation {
  id: string;
  impact: ViolationImpact;
  description: string;
  helpUrl: string;
  nodes: ViolationNode[];
}

export interface FixSuggestion {
  explanation: string;
  before: string;
  after: string;
  confidence: 'High' | 'Medium' | 'Low';
  wcagReference: string;
}

export interface Scan {
  id: string;
  user_id: string | null;
  url: string;
  status: ScanStatus;
  score: number | null;
  level: WCAGLevel | null;
  violations_data: Violation[] | null;
  created_at: string;
  expires_at: string | null;
}

export interface User {
  id: string;
  email: string;
  subscription_tier: SubscriptionTier;
  scans_used_this_month: number;
  created_at: string;
}

