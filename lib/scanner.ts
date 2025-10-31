import puppeteer from 'puppeteer';
import AxeBuilder from '@axe-core/puppeteer';
import { Violation, ViolationImpact } from '@/types/scan';

export interface ScanResult {
  violations: Violation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  score: number;
  level: string;
}

const IMPACT_MAP: Record<string, ViolationImpact> = {
  critical: 'critical',
  serious: 'serious',
  moderate: 'moderate',
  minor: 'minor',
};

export async function scanURL(url: string): Promise<ScanResult> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    // Set a reasonable timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Run axe accessibility scan
    const builder = new AxeBuilder(page);
    const results = await builder.analyze();

    // Process violations
    const violations = results.violations.map(v => ({
      id: v.id,
      impact: IMPACT_MAP[v.impact || 'minor'] || 'minor',
      description: v.description,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((node: any) => ({
        target: Array.isArray(node.target) ? node.target : [String(node.target)],
        html: node.html,
        data: {},
      })),
    })) as Violation[];

    // Calculate compliance score
    const total = results.violations.length + results.passes.length;
    const score = total > 0 
      ? Math.round((results.passes.length / total) * 100)
      : 100;

    // Determine WCAG level
    const level = calculateWCAGLevel(results.violations);

    return {
      violations,
      passes: results.passes.length,
      incomplete: results.incomplete?.length || 0,
      inapplicable: results.inapplicable?.length || 0,
      score,
      level,
    };
  } finally {
    await browser.close();
  }
}

function calculateWCAGLevel(violations: any[]): string {
  const hasCritical = violations.some(v => v.impact === 'critical');
  const hasSerious = violations.some(v => v.impact === 'serious');
  
  if (!hasCritical && !hasSerious) return 'AAA';
  if (!hasSerious) return 'AA';
  return 'A';
}

