/**
 * Confidence Scorer Utility
 * Calculates confidence scores for gap detection (0-100)
 */

import type { Evidence, EvidenceType, GapStatus } from '../../types/roadmap.js';
import { CONFIDENCE_THRESHOLDS } from '../../types/roadmap.js';

/**
 * Evidence type weights for confidence scoring
 * Positive values increase confidence, negative values decrease it
 */
const EVIDENCE_WEIGHTS: Record<EvidenceType, number> = {
  // Strong positive evidence (implementation exists)
  'exact-function-match': 50,
  'ast-signature-verified': 40,
  'test-file-exists': 20,

  // Weak positive evidence
  'name-similarity-only': 10,

  // Strong negative evidence (implementation missing/incomplete)
  'file-not-found': -50,
  'function-not-found': -40,
  'returns-todo-comment': -30,
  'returns-guidance-text': -35,
  'test-file-missing': -20,
  'comments-suggest-incomplete': -25,
};

/**
 * Base confidence scores by gap status
 */
const BASE_CONFIDENCE_BY_STATUS: Record<GapStatus, number> = {
  complete: 90,
  partial: 60,
  stub: 40,
  missing: 20,
};

export interface ConfidenceScore {
  score: number; // 0-100
  level: 'very-high' | 'high' | 'medium' | 'low' | 'very-low';
  breakdown: ConfidenceBreakdown;
  reasoning: string;
}

export interface ConfidenceBreakdown {
  baseScore: number;
  evidenceScore: number;
  adjustments: ConfidenceAdjustment[];
  finalScore: number;
}

export interface ConfidenceAdjustment {
  reason: string;
  impact: number;
  evidence?: Evidence;
}

export class ConfidenceScorer {
  /**
   * Calculate confidence score for a gap
   * @param status - Gap status
   * @param evidence - Array of evidence
   * @returns Confidence score with breakdown
   */
  calculateScore(status: GapStatus, evidence: Evidence[]): ConfidenceScore {
    // Start with base score from status
    const baseScore = BASE_CONFIDENCE_BY_STATUS[status];

    // Calculate evidence score
    const evidenceScore = this.calculateEvidenceScore(evidence);

    // Apply adjustments
    const adjustments = this.calculateAdjustments(evidence);

    // Calculate final score (capped between 0-100)
    let finalScore = baseScore + evidenceScore;
    for (const adjustment of adjustments) {
      finalScore += adjustment.impact;
    }
    finalScore = Math.max(0, Math.min(100, finalScore));

    // Determine confidence level
    const level = this.getConfidenceLevel(finalScore);

    // Generate reasoning
    const reasoning = this.generateReasoning(status, evidence, finalScore);

    return {
      score: finalScore,
      level,
      breakdown: {
        baseScore,
        evidenceScore,
        adjustments,
        finalScore,
      },
      reasoning,
    };
  }

  /**
   * Calculate score contribution from evidence
   * @param evidence - Array of evidence
   * @returns Evidence score contribution
   */
  private calculateEvidenceScore(evidence: Evidence[]): number {
    let score = 0;

    for (const item of evidence) {
      // Use explicit confidenceImpact if provided
      if (item.confidenceImpact !== undefined) {
        score += item.confidenceImpact;
      } else {
        // Otherwise use evidence type weight
        const weight = EVIDENCE_WEIGHTS[item.type] || 0;
        score += weight;
      }
    }

    return score;
  }

  /**
   * Calculate additional adjustments
   * @param evidence - Array of evidence
   * @returns Array of adjustments
   */
  private calculateAdjustments(evidence: Evidence[]): ConfidenceAdjustment[] {
    const adjustments: ConfidenceAdjustment[] = [];

    // Multiple strong positive signals increase confidence
    const positiveEvidence = evidence.filter(e => {
      const weight = EVIDENCE_WEIGHTS[e.type] || 0;
      return weight > 20;
    });

    if (positiveEvidence.length >= 3) {
      adjustments.push({
        reason: 'Multiple strong positive signals',
        impact: 10,
      });
    }

    // Multiple negative signals decrease confidence
    const negativeEvidence = evidence.filter(e => {
      const weight = EVIDENCE_WEIGHTS[e.type] || 0;
      return weight < -20;
    });

    if (negativeEvidence.length >= 2) {
      adjustments.push({
        reason: 'Multiple negative signals',
        impact: -10,
      });
    }

    // Test coverage bonus
    const hasTests = evidence.some(e => e.type === 'test-file-exists');
    if (hasTests) {
      adjustments.push({
        reason: 'Test coverage exists',
        impact: 5,
      });
    }

    // Missing tests penalty
    const missingTests = evidence.some(e => e.type === 'test-file-missing');
    if (missingTests) {
      adjustments.push({
        reason: 'Missing test coverage',
        impact: -5,
      });
    }

    // Stub detection penalty
    const hasStub = evidence.some(
      e => e.type === 'returns-todo-comment' || e.type === 'returns-guidance-text'
    );
    if (hasStub) {
      adjustments.push({
        reason: 'Stub implementation detected',
        impact: -10,
      });
    }

    return adjustments;
  }

  /**
   * Get confidence level from score
   * @param score - Confidence score (0-100)
   * @returns Confidence level
   */
  private getConfidenceLevel(score: number): 'very-high' | 'high' | 'medium' | 'low' | 'very-low' {
    if (score >= CONFIDENCE_THRESHOLDS.VERY_HIGH) return 'very-high';
    if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'high';
    if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
    if (score >= CONFIDENCE_THRESHOLDS.LOW) return 'low';
    return 'very-low';
  }

  /**
   * Generate human-readable reasoning
   * @param status - Gap status
   * @param evidence - Array of evidence
   * @param score - Final confidence score
   * @returns Reasoning string
   */
  private generateReasoning(status: GapStatus, evidence: Evidence[], score: number): string {
    const reasons: string[] = [];

    // Status reasoning
    if (status === 'complete') {
      reasons.push('Implementation appears complete');
    } else if (status === 'partial') {
      reasons.push('Partial implementation found');
    } else if (status === 'stub') {
      reasons.push('Only stub implementation exists');
    } else {
      reasons.push('No implementation found');
    }

    // Evidence reasoning
    const strongPositive = evidence.filter(e => {
      const weight = EVIDENCE_WEIGHTS[e.type] || 0;
      return weight > 30;
    });

    const strongNegative = evidence.filter(e => {
      const weight = EVIDENCE_WEIGHTS[e.type] || 0;
      return weight < -30;
    });

    if (strongPositive.length > 0) {
      reasons.push(
        `Strong evidence found: ${strongPositive.map(e => e.description).join(', ')}`
      );
    }

    if (strongNegative.length > 0) {
      reasons.push(
        `Concerns: ${strongNegative.map(e => e.description).join(', ')}`
      );
    }

    // Test coverage
    const hasTests = evidence.some(e => e.type === 'test-file-exists');
    if (hasTests) {
      reasons.push('Test coverage exists');
    }

    return reasons.join('. ') + '.';
  }

  /**
   * Compare two confidence scores
   * @param a - First score
   * @param b - Second score
   * @returns Positive if a > b, negative if a < b, 0 if equal
   */
  compareScores(a: ConfidenceScore, b: ConfidenceScore): number {
    return a.score - b.score;
  }

  /**
   * Filter evidence by minimum confidence threshold
   * @param evidence - Array of evidence
   * @param minConfidence - Minimum confidence score (0-100)
   * @returns Filtered evidence
   */
  filterByConfidence(evidence: Evidence[], minConfidence: number): Evidence[] {
    return evidence.filter(e => {
      const weight = EVIDENCE_WEIGHTS[e.type] || 0;
      const impact = e.confidenceImpact !== undefined ? e.confidenceImpact : weight;
      return impact >= minConfidence;
    });
  }

  /**
   * Aggregate confidence scores from multiple gaps
   * @param scores - Array of confidence scores
   * @returns Aggregated score
   */
  aggregateScores(scores: ConfidenceScore[]): ConfidenceScore {
    if (scores.length === 0) {
      return {
        score: 0,
        level: 'very-low',
        breakdown: {
          baseScore: 0,
          evidenceScore: 0,
          adjustments: [],
          finalScore: 0,
        },
        reasoning: 'No scores to aggregate',
      };
    }

    // Calculate weighted average
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const avgScore = Math.round(totalScore / scores.length);

    return {
      score: avgScore,
      level: this.getConfidenceLevel(avgScore),
      breakdown: {
        baseScore: avgScore,
        evidenceScore: 0,
        adjustments: [
          {
            reason: `Aggregated from ${scores.length} scores`,
            impact: 0,
          },
        ],
        finalScore: avgScore,
      },
      reasoning: `Aggregated confidence from ${scores.length} gaps with average score ${avgScore}`,
    };
  }

  /**
   * Calculate confidence for implementation completeness
   * @param implemented - Number of implemented requirements
   * @param total - Total number of requirements
   * @returns Confidence score
   */
  calculateCompletenessConfidence(implemented: number, total: number): ConfidenceScore {
    if (total === 0) {
      return {
        score: 0,
        level: 'very-low',
        breakdown: {
          baseScore: 0,
          evidenceScore: 0,
          adjustments: [],
          finalScore: 0,
        },
        reasoning: 'No requirements to assess',
      };
    }

    const percentage = (implemented / total) * 100;
    const score = Math.round(percentage);

    return {
      score,
      level: this.getConfidenceLevel(score),
      breakdown: {
        baseScore: score,
        evidenceScore: 0,
        adjustments: [],
        finalScore: score,
      },
      reasoning: `${implemented} of ${total} requirements implemented (${percentage.toFixed(1)}%)`,
    };
  }

  /**
   * Create evidence object with automatic confidence impact
   * @param type - Evidence type
   * @param description - Human-readable description
   * @param location - Optional file location
   * @param snippet - Optional code snippet
   * @returns Evidence object
   */
  createEvidence(
    type: EvidenceType,
    description: string,
    location?: string,
    snippet?: string
  ): Evidence {
    const confidenceImpact = EVIDENCE_WEIGHTS[type] || 0;

    return {
      type,
      description,
      location,
      snippet,
      confidenceImpact,
    };
  }

  /**
   * Get evidence weight for a type
   * @param type - Evidence type
   * @returns Weight value
   */
  getEvidenceWeight(type: EvidenceType): number {
    return EVIDENCE_WEIGHTS[type] || 0;
  }

  /**
   * Get confidence threshold by name
   * @param name - Threshold name
   * @returns Threshold value
   */
  getThreshold(name: keyof typeof CONFIDENCE_THRESHOLDS): number {
    return CONFIDENCE_THRESHOLDS[name];
  }
}

/**
 * Utility function to create a ConfidenceScorer instance
 */
export function createConfidenceScorer(): ConfidenceScorer {
  return new ConfidenceScorer();
}

/**
 * Quick score calculation utility
 */
export function calculateConfidence(status: GapStatus, evidence: Evidence[]): number {
  const scorer = new ConfidenceScorer();
  return scorer.calculateScore(status, evidence).score;
}

/**
 * Create evidence with automatic confidence impact
 */
export function createEvidence(
  type: EvidenceType,
  description: string,
  location?: string,
  snippet?: string
): Evidence {
  const scorer = new ConfidenceScorer();
  return scorer.createEvidence(type, description, location, snippet);
}
