import puppeteer from 'puppeteer';
import AxeBuilder from '@axe-core/puppeteer';
import { getBrowserPool } from '@/lib/browser-pool';
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

  const pool = getBrowserPool(3);
  const startTs = Date.now();
  const { page, release } = await pool.acquirePage();
  try {
    // Abort non-essential requests to speed up scans
    await page.setRequestInterception(true);
    const blockedResourceTypes = new Set(['image', 'media', 'font']);
    const blockedUrlFragments = [
      'google-analytics.com',
      'googletagmanager.com',
      'doubleclick.net',
      'facebook.net',
      'hotjar',
      'segment.io',
    ];
    page.on('request', (req) => {
      const url = req.url();
      if (blockedResourceTypes.has(req.resourceType()) || blockedUrlFragments.some(f => url.includes(f))) {
        return req.abort();
      }
      return req.continue();
    });
    
    // Navigate fast: DOMContentLoaded is enough for axe (we handle dynamic waits below)
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 25000,
    });

    // Wait for dynamic content to load
    // This ensures React, Vue, and other SPAs have time to render
    await waitForDynamicContent(page);

    // Run axe accessibility scan (limit to A/AA for speed)
    const builder = new AxeBuilder(page).withTags([
      'wcag2a', 'wcag21a', 'wcag22a',
      'wcag2aa', 'wcag21aa', 'wcag22aa',
    ]);
    const results = await builder.analyze();

    // Process violations
    const violations = await Promise.all(results.violations.map(async v => ({
      id: v.id,
      impact: IMPACT_MAP[v.impact || 'minor'] || 'minor',
      description: v.description,
      helpUrl: v.helpUrl,
      nodes: await Promise.all(v.nodes.map(async (node: any) => {
        const targetArr = Array.isArray(node.target) ? node.target : [String(node.target)];
        // Attempt to read optional source hints from DOM for the first selector
        let sourcePath: string | null = null;
        let sourceLine: string | null = null;
        try {
          const firstSelector = targetArr[0];
          if (firstSelector) {
            const { path, line } = await page.evaluate((sel) => {
              const el = document.querySelector(sel as string) as HTMLElement | null;
              return {
                path: el?.getAttribute('data-source-path') || null,
                line: el?.getAttribute('data-source-line') || null,
              };
            }, firstSelector);
            sourcePath = path;
            sourceLine = line;
          }
        } catch {}

        const extraData = v.id === 'color-contrast' && node.any?.[0]
          ? {
              foregroundColor: node.any[0].data?.fgColor,
              backgroundColor: node.any[0].data?.bgColor,
              contrastRatio: node.any[0].data?.contrastRatio,
              fontSize: node.any[0].data?.fontSize,
              ...node.any[0].data,
            }
          : (node.any?.[0]?.data || {});

        return {
          target: targetArr,
          html: node.html,
          data: {
            ...extraData,
            sourcePath: sourcePath || undefined,
            sourceLine: sourceLine || undefined,
          },
        };
      })),
    }))) as Violation[];

    // Calculate compliance score
    const total = results.violations.length + results.passes.length;
    const score = total > 0 
      ? Math.round((results.passes.length / total) * 100)
      : 100;

    // Determine WCAG level based on actual WCAG tags from violations
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
    await release();
  }
}

/**
 * Wait for dynamic content to load and stabilize.
 * Handles React, Vue, Angular, and other SPA frameworks that may load content asynchronously.
 */
async function waitForDynamicContent(page: puppeteer.Page): Promise<void> {
  try {
    // Wait a short time for JavaScript frameworks to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Wait for common SPA indicators to stabilize
    // Check if React, Vue, or Angular have finished rendering
    try {
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          // Check for React, Vue, or Angular
          const hasReact = !!(window as any).React;
          const hasVue = !!(window as any).Vue;
          const hasAngular = !!(window as any).ng;
          
          // If any framework is detected, wait a bit for state updates
          if (hasReact || hasVue || hasAngular) {
            // Wait for framework to finish rendering and state updates
            setTimeout(resolve, 500);
          } else {
            // No framework detected, resolve immediately
            resolve();
          }
        });
      });
    } catch (e) {
      // Framework detection failed, continue anyway
    }
    
    // Wait for any pending animations or transitions to complete
    try {
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          // Give a brief moment for CSS transitions and animations to complete
          setTimeout(resolve, 300);
        });
      });
    } catch (e) {
      // Animation wait failed, continue anyway
    }
    
    // Ensure document is fully ready and DOM is stable
    try {
      await page.waitForFunction(
        () => document.readyState === 'complete',
        { timeout: 5000 }
      );
    } catch (e) {
      // Document might already be complete, continue anyway
    }
    
    // Additional wait for any late-loading dynamic content (e.g., lazy-loaded images)
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    // If waiting fails, continue anyway - page might be stable
    // We don't want to fail the entire scan if dynamic content detection has issues
  }
}

/**
 * Calculate WCAG compliance level based on violation tags.
 * Axe-core provides WCAG tags (e.g., 'wcag2a', 'wcag21aa', 'wcag22aaa')
 * which accurately map to WCAG 2.0/2.1/2.2 Level A/AA/AAA.
 * 
 * @internal Exported for testing purposes
 */
export function calculateWCAGLevel(violations: any[]): string {
  if (!violations || violations.length === 0) {
    return 'AAA'; // No violations means highest level compliance
  }

  // Map WCAG tags to their compliance levels
  // Level 1 = A, Level 2 = AA, Level 3 = AAA
  const wcagTagLevels: Record<string, number> = {
    'wcag2a': 1,
    'wcag2aa': 2,
    'wcag2aaa': 3,
    'wcag21a': 1,
    'wcag21aa': 2,
    'wcag21aaa': 3,
    'wcag22a': 1,
    'wcag22aa': 2,
    'wcag22aaa': 3,
  };

  let highestViolationLevel = 0;

  // Check all violations for their WCAG tags
  violations.forEach(violation => {
    const tags = violation.tags || [];
    tags.forEach((tag: string) => {
      const level = wcagTagLevels[tag.toLowerCase()];
      if (level && level > highestViolationLevel) {
        highestViolationLevel = level;
      }
    });
  });

  // If we found specific WCAG violations, determine level
  // The presence of any violation means we can't achieve that level
  // If highest is Level 1 (A), site fails A and above
  // If highest is Level 2 (AA), site fails AA and above but passes A
  // If highest is Level 3 (AAA), site fails AAA but passes AA
  
  // However, for compliance reporting, we report the lowest level that fails
  // So if we have AA violations, the site is at best Level A compliant
  switch (highestViolationLevel) {
    case 0:
      // No recognized WCAG tags found - fallback to impact-based assessment
      // This handles edge cases where violations don't have standard tags
      const hasCritical = violations.some((v: any) => v.impact === 'critical');
      const hasSerious = violations.some((v: any) => v.impact === 'serious');
      if (hasCritical || hasSerious) return 'A';
      return 'AAA';
    case 1:
      return 'fail'; // Level A violations found - fails A compliance
    case 2:
      return 'A'; // Level AA violations found - passes A, fails AA
    case 3:
      return 'AA'; // Level AAA violations found - passes AA, fails AAA
    default:
      return 'AAA';
  }
}

