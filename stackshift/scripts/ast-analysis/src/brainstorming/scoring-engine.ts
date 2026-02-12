/**
 * Feature Scoring Engine
 * Scores brainstormed features on impact, effort, ROI, strategic value, and risk
 */

import type { DesirableFeature, ScoredFeature, ProjectContext, Priority } from '../types/roadmap.js';
import { createEffortEstimate } from '../types/roadmap.js';

/**
 * Scoring Engine Configuration
 */
export interface ScoringConfig {
  /**
   * Weights for different scoring factors (must sum to 1.0)
   */
  weights?: {
    impact: number;
    effort: number;
    strategicValue: number;
    risk: number;
  };

  /**
   * Verbose logging
   */
  verbose?: boolean;
}

const DEFAULT_CONFIG: Required<ScoringConfig> = {
  weights: {
    impact: 0.4,
    effort: 0.3,
    strategicValue: 0.2,
    risk: 0.1,
  },
  verbose: false,
};

/**
 * Feature Scoring Engine
 * Scores features across multiple dimensions
 */
export class ScoringEngine {
  private config: Required<ScoringConfig>;

  constructor(config: ScoringConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Score multiple features
   * @param features - Features to score
   * @param context - Project context
   * @returns Scored features sorted by priority score
   */
  async scoreFeatures(
    features: DesirableFeature[],
    context: ProjectContext
  ): Promise<ScoredFeature[]> {
    this.log(`Scoring ${features.length} features`);

    const scored: ScoredFeature[] = [];

    for (const feature of features) {
      const impact = this.scoreImpact(feature, context);
      const effort = this.scoreEffort(feature, context);
      const roi = this.calculateROI(impact, effort);
      const strategicValue = this.scoreStrategicValue(feature, context);
      const riskScore = this.scoreRisk(feature, context);

      // Calculate composite priority score (0-10)
      const priorityScore =
        impact * this.config.weights.impact +
        (10 - effort) * this.config.weights.effort + // Invert effort (lower is better)
        strategicValue * this.config.weights.strategicValue +
        (10 - riskScore) * this.config.weights.risk; // Invert risk (lower is better)

      // Determine priority level
      const priority = this.determinePriority(priorityScore, impact, effort);

      // Estimate effort in hours
      const effortHours = this.estimateHours(effort, feature);

      scored.push({
        ...feature,
        impact,
        impactScore: impact,
        effortScore: effort,
        effort: createEffortEstimate(effortHours, 'medium', 'ai'),
        roi,
        strategicValue,
        riskScore,
        priority,
        priorityScore,
        scoringDetails: {
          impactFactors: this.getImpactFactors(feature, context),
          effortFactors: this.getEffortFactors(feature, context),
          strategicFactors: this.getStrategicFactors(feature, context),
          riskFactors: this.getRiskFactors(feature, context),
        },
      });
    }

    // Sort by priority score (descending)
    scored.sort((a, b) => b.priorityScore - a.priorityScore);

    this.log(`Scoring complete. Top feature: ${scored[0]?.title} (score: ${scored[0]?.priorityScore.toFixed(1)})`);

    return scored;
  }

  /**
   * Score feature impact (1-10)
   * Higher = more impactful to users/business
   */
  scoreImpact(feature: DesirableFeature, context: ProjectContext): number {
    let score = 5; // Start neutral

    const lower = (feature.title + ' ' + feature.description).toLowerCase();

    // High impact keywords
    if (lower.includes('security') || lower.includes('vulnerability')) score += 3;
    if (lower.includes('performance') || lower.includes('speed')) score += 2;
    if (lower.includes('user experience') || lower.includes('ux')) score += 2;
    if (lower.includes('automation') || lower.includes('automatic')) score += 2;
    if (lower.includes('error') || lower.includes('crash') || lower.includes('bug')) score += 2;
    if (lower.includes('data loss') || lower.includes('corruption')) score += 3;

    // Category-based impact
    const categoryImpact: Record<string, number> = {
      'core-functionality': 3,
      'developer-experience': 2,
      'user-experience': 2,
      'performance': 2,
      'security': 3,
      'testing': 1,
      'documentation': 1,
      'integrations': 1,
    };

    score += categoryImpact[feature.category] || 0;

    // Strategic alignment
    if (typeof feature.strategicAlignment === 'number') {
      score += Math.min(feature.strategicAlignment * 0.5, 2);
    }

    return Math.max(1, Math.min(10, score));
  }

  /**
   * Score implementation effort (1-10)
   * Higher = more effort required
   */
  scoreEffort(feature: DesirableFeature, context: ProjectContext): number {
    let score = 5; // Start neutral

    const lower = (feature.title + ' ' + feature.description).toLowerCase();

    // Complexity indicators (increase effort)
    if (lower.includes('ai') || lower.includes('machine learning')) score += 3;
    if (lower.includes('distributed') || lower.includes('scalable')) score += 2;
    if (lower.includes('migration') || lower.includes('refactor')) score += 2;
    if (lower.includes('architecture') || lower.includes('redesign')) score += 2;
    if (lower.includes('integration') && lower.includes('third-party')) score += 2;
    if (lower.includes('real-time') || lower.includes('streaming')) score += 2;

    // Simplicity indicators (decrease effort)
    if (lower.includes('simple') || lower.includes('basic')) score -= 2;
    if (lower.includes('ui') || lower.includes('display')) score -= 1;
    if (lower.includes('logging') || lower.includes('error message')) score -= 1;
    if (lower.includes('documentation') || lower.includes('readme')) score -= 2;

    // Tech stack familiarity
    if (context.language === 'typescript' && lower.includes('typescript')) score -= 1;
    if (context.frameworks.includes('React') && lower.includes('react')) score -= 1;

    // Codebase size impact
    if (context.linesOfCode > 100000) {
      score += 1; // Larger codebases are harder to modify
    }

    return Math.max(1, Math.min(10, score));
  }

  /**
   * Calculate ROI (Return on Investment)
   * Impact / Effort ratio
   */
  calculateROI(impact: number, effort: number): number {
    if (effort === 0) return impact * 10;
    return impact / effort;
  }

  /**
   * Score strategic value (1-10)
   * Alignment with project goals and market trends
   */
  scoreStrategicValue(feature: DesirableFeature, context: ProjectContext): number {
    let score = 5;

    // Strategic alignment
    if (typeof feature.strategicAlignment === 'number') {
      score += Math.min(feature.strategicAlignment * 0.3, 3);
    }

    // Market trends
    const lower = (feature.title + ' ' + feature.description).toLowerCase();
    if (lower.includes('ai') || lower.includes('llm')) score += 2;
    if (lower.includes('cloud') || lower.includes('serverless')) score += 1;
    if (lower.includes('real-time') || lower.includes('collaboration')) score += 1;
    if (lower.includes('mobile') || lower.includes('responsive')) score += 1;

    // Competitive advantage
    if (lower.includes('unique') || lower.includes('innovative')) score += 2;
    if (lower.includes('differentiator') || lower.includes('competitive')) score += 1;

    // User demand
    if (lower.includes('requested') || lower.includes('demand')) score += 2;

    return Math.max(1, Math.min(10, score));
  }

  /**
   * Score risk (1-10)
   * Higher = more risky to implement
   */
  scoreRisk(feature: DesirableFeature, context: ProjectContext): number {
    let score = 3; // Start low risk

    const lower = (feature.title + ' ' + feature.description).toLowerCase();

    // High risk indicators
    if (lower.includes('breaking') || lower.includes('migration')) score += 3;
    if (lower.includes('experimental') || lower.includes('beta')) score += 2;
    if (lower.includes('security') && lower.includes('change')) score += 2;
    if (lower.includes('database') && lower.includes('schema')) score += 2;
    if (lower.includes('authentication') || lower.includes('authorization')) score += 2;
    if (lower.includes('payment') || lower.includes('billing')) score += 3;

    // Dependencies risk
    if (lower.includes('third-party') || lower.includes('external')) score += 1;
    if (lower.includes('api') && lower.includes('integration')) score += 1;

    // Technical debt risk
    if (lower.includes('refactor') || lower.includes('rewrite')) score += 1;

    return Math.max(1, Math.min(10, score));
  }

  /**
   * Determine priority level from scores
   */
  private determinePriority(priorityScore: number, impact: number, effort: number): Priority {
    // P0: High impact, any effort with high priority score OR critical keywords
    if (impact >= 8 && priorityScore >= 7) return 'P0';

    // P1: High impact or high priority score
    if (impact >= 7 || priorityScore >= 6) return 'P1';

    // P2: Moderate impact/score
    if (impact >= 5 || priorityScore >= 4) return 'P2';

    // P3: Low impact/score
    return 'P3';
  }

  /**
   * Estimate hours from effort score
   */
  private estimateHours(effortScore: number, feature: DesirableFeature): number {
    // Map effort score (1-10) to hours
    // 1-3: Simple (4-16h)
    // 4-6: Medium (16-40h)
    // 7-9: Complex (40-80h)
    // 10: Very complex (80-160h)

    const baseHours: Record<number, number> = {
      1: 4,
      2: 8,
      3: 16,
      4: 20,
      5: 28,
      6: 40,
      7: 50,
      8: 64,
      9: 80,
      10: 120,
    };

    return baseHours[effortScore] || 24;
  }

  /**
   * Get impact factors for explanation
   */
  private getImpactFactors(feature: DesirableFeature, context: ProjectContext): string[] {
    const factors: string[] = [];
    const lower = (feature.title + ' ' + feature.description).toLowerCase();

    if (lower.includes('security')) factors.push('Security improvement');
    if (lower.includes('performance')) factors.push('Performance enhancement');
    if (lower.includes('user experience')) factors.push('UX improvement');
    if (lower.includes('automation')) factors.push('Automation benefit');
    if (feature.category === 'core-functionality') factors.push('Core functionality');

    return factors.length > 0 ? factors : ['General improvement'];
  }

  /**
   * Get effort factors for explanation
   */
  private getEffortFactors(feature: DesirableFeature, context: ProjectContext): string[] {
    const factors: string[] = [];
    const lower = (feature.title + ' ' + feature.description).toLowerCase();

    if (lower.includes('ai')) factors.push('AI/ML complexity');
    if (lower.includes('migration')) factors.push('Migration required');
    if (lower.includes('architecture')) factors.push('Architecture changes');
    if (context.linesOfCode > 100000) factors.push('Large codebase');

    return factors.length > 0 ? factors : ['Standard implementation'];
  }

  /**
   * Get strategic factors for explanation
   */
  private getStrategicFactors(feature: DesirableFeature, context: ProjectContext): string[] {
    const factors: string[] = [];
    const lower = (feature.title + ' ' + feature.description).toLowerCase();

    if (typeof feature.strategicAlignment === 'number' && feature.strategicAlignment > 5) {
      factors.push('High strategic alignment');
    }
    if (lower.includes('ai')) factors.push('AI trend alignment');
    if (lower.includes('competitive')) factors.push('Competitive advantage');

    return factors.length > 0 ? factors : ['Standard feature'];
  }

  /**
   * Get risk factors for explanation
   */
  private getRiskFactors(feature: DesirableFeature, context: ProjectContext): string[] {
    const factors: string[] = [];
    const lower = (feature.title + ' ' + feature.description).toLowerCase();

    if (lower.includes('breaking')) factors.push('Breaking changes');
    if (lower.includes('security')) factors.push('Security implications');
    if (lower.includes('migration')) factors.push('Migration complexity');
    if (lower.includes('third-party')) factors.push('External dependencies');

    return factors.length > 0 ? factors : ['Low risk'];
  }

  /**
   * Log message if verbose
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[ScoringEngine] ${message}`);
    }
  }
}

/**
 * Create a ScoringEngine instance
 */
export function createScoringEngine(config?: ScoringConfig): ScoringEngine {
  return new ScoringEngine(config);
}
