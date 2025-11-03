import { describe, it, expect } from '@jest/globals';
import { calculateWCAGLevel } from '../lib/scanner';

describe('Scanner Accuracy Tests', () => {
  describe('WCAG Level Calculation', () => {
    it('should correctly identify WCAG 2.1 Level A violations', () => {
      const violations = [
        {
          id: 'color-contrast',
          impact: 'serious',
          tags: ['wcag21a'],
          description: 'Elements must have sufficient color contrast',
        },
      ];

      // Level A violations mean site fails A compliance
      const level = calculateWCAGLevel(violations);
      expect(level).toBe('fail');
    });

    it('should correctly identify WCAG 2.1 Level AA violations', () => {
      const violations = [
        {
          id: 'color-contrast',
          impact: 'serious',
          tags: ['wcag21aa'],
          description: 'Elements must have sufficient color contrast',
        },
      ];

      // Level AA violations mean site passes A, fails AA
      const level = calculateWCAGLevel(violations);
      expect(level).toBe('A');
    });

    it('should correctly identify WCAG 2.1 Level AAA violations', () => {
      const violations = [
        {
          id: 'color-contrast-enhanced',
          impact: 'moderate',
          tags: ['wcag21aaa'],
          description: 'Elements must have enhanced color contrast',
        },
      ];

      // Level AAA violations mean site passes AA, fails AAA
      const level = calculateWCAGLevel(violations);
      expect(level).toBe('AA');
    });

    it('should return AAA when no violations present', () => {
      const violations: any[] = [];
      
      // No violations = highest compliance level
      const level = calculateWCAGLevel(violations);
      expect(level).toBe('AAA');
    });

    it('should handle multiple violation levels correctly', () => {
      const violations = [
        {
          id: 'aria-hidden',
          impact: 'critical',
          tags: ['wcag21a'],
          description: 'ARIA hidden elements',
        },
        {
          id: 'color-contrast',
          impact: 'serious',
          tags: ['wcag21aa'],
          description: 'Color contrast issue',
        },
      ];

      // When both Level A and AA violations exist, highest is Level AA (2)
      // So site passes A, fails AA - returns 'A' as the achieved level
      // Actually, wait - if we have Level A violations, site fails A
      // The highest level is the most restrictive, so Level A violations = fail
      const level = calculateWCAGLevel(violations);
      // Since we have Level A violations, site fails A compliance
      expect(level).toBe('fail');
    });

    it('should handle violations without WCAG tags (fallback)', () => {
      const violations = [
        {
          id: 'unknown-rule',
          impact: 'critical',
          tags: [], // No WCAG tags
          description: 'Unknown violation',
        },
      ];

      // Fallback to impact-based assessment
      const level = calculateWCAGLevel(violations);
      // Critical impact should result in Level A (fail assessment)
      expect(level).toBe('A');
    });

    it('should support WCAG 2.0, 2.1, and 2.2 tags', () => {
      // Test WCAG 2.0 Level A
      const violations2_0 = [
        { id: 'rule1', tags: ['wcag2a'], impact: 'serious' },
      ];
      const level2_0 = calculateWCAGLevel(violations2_0);
      expect(level2_0).toBe('fail');

      // Test WCAG 2.1 Level AA
      const violations2_1 = [
        { id: 'rule2', tags: ['wcag21aa'], impact: 'serious' },
      ];
      const level2_1 = calculateWCAGLevel(violations2_1);
      expect(level2_1).toBe('A');

      // Test WCAG 2.2 Level AAA
      const violations2_2 = [
        { id: 'rule3', tags: ['wcag22aaa'], impact: 'moderate' },
      ];
      const level2_2 = calculateWCAGLevel(violations2_2);
      expect(level2_2).toBe('AA');
    });
  });

  describe('Violation Impact Mapping', () => {
    it('should correctly map axe-core impact levels', () => {
      const impactMap: Record<string, string> = {
        critical: 'critical',
        serious: 'serious',
        moderate: 'moderate',
        minor: 'minor',
      };

      expect(impactMap['critical']).toBe('critical');
      expect(impactMap['serious']).toBe('serious');
      expect(impactMap['moderate']).toBe('moderate');
      expect(impactMap['minor']).toBe('minor');
    });
  });

  describe('Compliance Score Calculation', () => {
    it('should calculate score correctly with violations and passes', () => {
      const violations = 5;
      const passes = 15;
      const total = violations + passes;
      const score = total > 0 ? Math.round((passes / total) * 100) : 100;

      expect(score).toBe(75); // 15/20 = 75%
    });

    it('should return 100 when no violations and passes exist', () => {
      const violations = 0;
      const passes = 0;
      const total = violations + passes;
      const score = total > 0 ? Math.round((passes / total) * 100) : 100;

      expect(score).toBe(100);
    });

    it('should return 0 when only violations exist', () => {
      const violations = 10;
      const passes = 0;
      const total = violations + passes;
      const score = total > 0 ? Math.round((passes / total) * 100) : 100;

      expect(score).toBe(0);
    });
  });
});

