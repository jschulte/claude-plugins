import { describe, it, expect } from 'vitest';
import { ConfidenceScorer, calculateConfidence, createEvidence } from '../confidence-scorer.js';
import type { Evidence, GapStatus, EvidenceType } from '../../../types/roadmap.js';

function makeEvidence(type: EvidenceType, description = 'test', confidenceImpact?: number): Evidence {
  return {
    type,
    description,
    confidenceImpact: confidenceImpact ?? 0,
  };
}

describe('ConfidenceScorer', () => {
  const scorer = new ConfidenceScorer();

  describe('calculateScore', () => {
    it('returns base score for status with no evidence', () => {
      const result = scorer.calculateScore('complete', []);
      expect(result.score).toBe(90);
      expect(result.level).toBe('very-high');
    });

    it('uses base score of 60 for partial status', () => {
      const result = scorer.calculateScore('partial', []);
      expect(result.score).toBe(60);
    });

    it('uses base score of 40 for stub status', () => {
      const result = scorer.calculateScore('stub', []);
      expect(result.score).toBe(40);
    });

    it('uses base score of 20 for missing status', () => {
      const result = scorer.calculateScore('missing', []);
      expect(result.score).toBe(20);
    });

    it('adds evidence confidenceImpact when provided', () => {
      const evidence: Evidence[] = [
        makeEvidence('exact-function-match', 'found match', 30),
      ];
      const result = scorer.calculateScore('partial', evidence);
      // base 60 + evidence 30 = 90, plus test-coverage or adjustments
      expect(result.score).toBeGreaterThan(60);
    });

    it('uses evidence type weights when confidenceImpact is undefined', () => {
      const evidence: Evidence[] = [
        { type: 'exact-function-match', description: 'found', confidenceImpact: undefined as any },
      ];
      const result = scorer.calculateScore('missing', evidence);
      // base 20 + weight 50 = 70
      expect(result.score).toBeGreaterThanOrEqual(70);
    });

    it('caps score at 100', () => {
      const evidence: Evidence[] = [
        makeEvidence('exact-function-match', 'a', 50),
        makeEvidence('ast-signature-verified', 'b', 40),
      ];
      const result = scorer.calculateScore('complete', evidence);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('caps score at 0', () => {
      const evidence: Evidence[] = [
        makeEvidence('file-not-found', 'a', -50),
        makeEvidence('function-not-found', 'b', -40),
      ];
      const result = scorer.calculateScore('missing', evidence);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('applies stub detection penalty adjustment', () => {
      const withStub = scorer.calculateScore('stub', [
        makeEvidence('returns-todo-comment', 'has TODO', -30),
      ]);
      const withoutStub = scorer.calculateScore('stub', []);
      expect(withStub.score).toBeLessThan(withoutStub.score);
    });

    it('applies test coverage bonus adjustment', () => {
      const withTests = scorer.calculateScore('complete', [
        makeEvidence('test-file-exists', 'tests found', 20),
      ]);
      // Should have test coverage bonus in adjustments
      const hasTestAdj = withTests.breakdown.adjustments.some(
        a => a.reason === 'Test coverage exists'
      );
      expect(hasTestAdj).toBe(true);
    });

    it('returns correct breakdown structure', () => {
      const result = scorer.calculateScore('partial', []);
      expect(result.breakdown).toHaveProperty('baseScore', 60);
      expect(result.breakdown).toHaveProperty('evidenceScore', 0);
      expect(result.breakdown).toHaveProperty('adjustments');
      expect(result.breakdown).toHaveProperty('finalScore');
    });

    it('generates reasoning string', () => {
      const result = scorer.calculateScore('missing', []);
      expect(result.reasoning).toContain('No implementation found');
    });
  });

  describe('getConfidenceLevel', () => {
    it('returns very-high for score >= 90', () => {
      const result = scorer.calculateScore('complete', []);
      expect(result.level).toBe('very-high');
    });

    it('returns very-low for score < 30', () => {
      const result = scorer.calculateScore('missing', [
        makeEvidence('file-not-found', 'missing', -10),
      ]);
      expect(result.level).toBe('very-low');
    });
  });

  describe('compareScores', () => {
    it('returns positive when a > b', () => {
      const a = scorer.calculateScore('complete', []);
      const b = scorer.calculateScore('missing', []);
      expect(scorer.compareScores(a, b)).toBeGreaterThan(0);
    });

    it('returns negative when a < b', () => {
      const a = scorer.calculateScore('missing', []);
      const b = scorer.calculateScore('complete', []);
      expect(scorer.compareScores(a, b)).toBeLessThan(0);
    });
  });

  describe('aggregateScores', () => {
    it('returns very-low score for empty array', () => {
      const result = scorer.aggregateScores([]);
      expect(result.score).toBe(0);
      expect(result.level).toBe('very-low');
    });

    it('calculates average of multiple scores', () => {
      const scores = [
        scorer.calculateScore('complete', []),
        scorer.calculateScore('missing', []),
      ];
      const result = scorer.aggregateScores(scores);
      expect(result.score).toBe(Math.round((scores[0].score + scores[1].score) / 2));
    });
  });

  describe('calculateCompletenessConfidence', () => {
    it('returns 0 when total is 0', () => {
      const result = scorer.calculateCompletenessConfidence(0, 0);
      expect(result.score).toBe(0);
    });

    it('returns 100 when all requirements implemented', () => {
      const result = scorer.calculateCompletenessConfidence(10, 10);
      expect(result.score).toBe(100);
    });

    it('returns 50 for half implemented', () => {
      const result = scorer.calculateCompletenessConfidence(5, 10);
      expect(result.score).toBe(50);
    });
  });

  describe('createEvidence', () => {
    it('creates evidence with correct type and weight', () => {
      const evidence = scorer.createEvidence('exact-function-match', 'Found match');
      expect(evidence.type).toBe('exact-function-match');
      expect(evidence.confidenceImpact).toBe(50);
    });

    it('includes optional location and snippet', () => {
      const evidence = scorer.createEvidence('file-not-found', 'Missing', 'src/foo.ts', 'code');
      expect(evidence.location).toBe('src/foo.ts');
      expect(evidence.snippet).toBe('code');
    });
  });

  describe('filterByConfidence', () => {
    it('filters evidence above threshold', () => {
      const evidence: Evidence[] = [
        makeEvidence('exact-function-match', 'high', 50),
        makeEvidence('name-similarity-only', 'low', 10),
      ];
      const filtered = scorer.filterByConfidence(evidence, 20);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe('exact-function-match');
    });
  });

  describe('getEvidenceWeight', () => {
    it('returns correct weight for known types', () => {
      expect(scorer.getEvidenceWeight('exact-function-match')).toBe(50);
      expect(scorer.getEvidenceWeight('file-not-found')).toBe(-50);
      expect(scorer.getEvidenceWeight('test-file-exists')).toBe(20);
    });
  });

  describe('utility functions', () => {
    it('calculateConfidence returns a number', () => {
      const score = calculateConfidence('complete', []);
      expect(typeof score).toBe('number');
      expect(score).toBe(90);
    });

    it('createEvidence utility creates proper evidence', () => {
      const evidence = createEvidence('ast-signature-verified', 'Verified');
      expect(evidence.type).toBe('ast-signature-verified');
      expect(evidence.confidenceImpact).toBe(40);
    });
  });
});
