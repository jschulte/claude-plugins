/**
 * Roadmap Generator
 * Generates complete roadmaps from gaps and features
 * Implements User Story 4 (FR4): Prioritized Roadmap Generation
 */

import { v4 as uuidv4 } from 'uuid';
import { Prioritizer } from './prioritizer.js';
import type {
  Roadmap,
  RoadmapItem,
  SpecGap,
  FeatureGap,
  Phase,
  ProjectContext,
  Timeline,
  Risk,
  Dependency,
  Priority,
  RoadmapMetadata,
  RoadmapSummary,
  ScoredFeature,
} from '../types/roadmap.js';
import {
  createEffortEstimate,
  comparePriorities,
  EFFORT_MULTIPLIERS,
  HOURS_PER_WEEK,
} from '../types/roadmap.js';

/**
 * Roadmap Generation Configuration
 */
export interface RoadmapConfig {
  /**
   * Maximum number of phases
   */
  maxPhases?: number;

  /**
   * Maximum items per phase
   */
  maxItemsPerPhase?: number;

  /**
   * Phase strategy
   */
  phaseStrategy?: 'priority' | 'timeline' | 'dependency';

  /**
   * Include risk analysis
   */
  includeRisks?: boolean;

  /**
   * Include dependency analysis
   */
  includeDependencies?: boolean;

  /**
   * Team size for estimates
   */
  teamSize?: number;

  /**
   * Verbose logging
   */
  verbose?: boolean;
}

const DEFAULT_CONFIG: Required<RoadmapConfig> = {
  maxPhases: 4,
  maxItemsPerPhase: 15,
  phaseStrategy: 'priority',
  includeRisks: true,
  includeDependencies: true,
  teamSize: 2,
  verbose: false,
};

/**
 * Phase Configuration
 */
export interface PhaseConfig {
  strategy: 'priority' | 'timeline' | 'dependency';
  maxPhases?: number;
  maxItemsPerPhase?: number;
}

/**
 * Roadmap Generator
 * Creates complete roadmaps from gaps and features
 */
export class RoadmapGenerator {
  private config: Required<RoadmapConfig>;
  private prioritizer: Prioritizer;

  constructor(config: RoadmapConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.prioritizer = new Prioritizer({
      strategy: 'balanced',
      verbose: this.config.verbose,
    });
  }

  /**
   * Generate complete roadmap
   * @param gaps - Identified gaps
   * @param features - Brainstormed features
   * @param context - Project context
   * @param config - Generation configuration
   * @returns Complete roadmap
   */
  async generateRoadmap(
    gaps: (SpecGap | FeatureGap)[],
    features: ScoredFeature[],
    context: ProjectContext,
    config?: RoadmapConfig
  ): Promise<Roadmap> {
    this.log(`Generating roadmap from ${gaps.length} gaps and ${features.length} features`);

    // Merge config if provided
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Convert gaps and features to roadmap items
    const items = this.convertToRoadmapItems(gaps, features);

    this.log(`Created ${items.length} roadmap items`);

    // Prioritize items
    const prioritizedItems = await this.prioritizer.prioritize(items, context);

    // Resolve dependencies
    const orderedItems = await this.prioritizer.resolveDependencies(prioritizedItems);

    // Create phases
    const phases = await this.createPhases(orderedItems, {
      strategy: this.config.phaseStrategy,
      maxPhases: this.config.maxPhases,
      maxItemsPerPhase: this.config.maxItemsPerPhase,
    });

    this.log(`Created ${phases.length} phases`);

    // Generate metadata
    const metadata = this.generateMetadata(context, gaps.length, features.length, items.length);

    // Generate summary
    const summary = this.generateSummary(items, gaps, features, context);

    // Calculate timeline
    const timeline = this.estimateTimeline({ phases, allItems: orderedItems } as any, this.config.teamSize);

    // Identify risks
    const risks = this.config.includeRisks ? this.identifyRisks(items, context) : [];

    // Extract dependencies
    const dependencies = this.config.includeDependencies ? this.extractDependencies(items) : [];

    // Generate success criteria
    const successCriteria = this.generateSuccessCriteria(items, context);

    // Generate recommendations
    const recommendations = this.generateRecommendations(items, context);

    // Group by priority
    const priorities = this.groupByPriority(items);

    const roadmap: Roadmap = {
      metadata,
      summary,
      phases,
      allItems: orderedItems,
      priorities,
      timeline,
      risks,
      dependencies,
      successCriteria,
      recommendations,
    };

    this.log(`Roadmap generation complete`);

    return roadmap;
  }

  /**
   * Create phases from roadmap items
   * @param items - Roadmap items
   * @param config - Phasing strategy config
   * @returns Organized phases
   */
  async createPhases(items: RoadmapItem[], config?: PhaseConfig): Promise<Phase[]> {
    const phaseConfig = config || {
      strategy: this.config.phaseStrategy,
      maxPhases: this.config.maxPhases,
      maxItemsPerPhase: this.config.maxItemsPerPhase,
    };

    const phases: Phase[] = [];

    if (phaseConfig.strategy === 'priority') {
      // Group by priority: P0 → Phase 1, P1 → Phase 2, etc.
      const p0Items = items.filter(i => i.priority === 'P0');
      const p1Items = items.filter(i => i.priority === 'P1');
      const p2Items = items.filter(i => i.priority === 'P2');
      const p3Items = items.filter(i => i.priority === 'P3');

      if (p0Items.length > 0) {
        phases.push(this.createPhase(1, 'Critical Fixes', 'Fix blocking issues', p0Items));
      }
      if (p1Items.length > 0) {
        phases.push(
          this.createPhase(phases.length + 1, 'Core Features', 'Implement essential features', p1Items)
        );
      }
      if (p2Items.length > 0) {
        phases.push(
          this.createPhase(phases.length + 1, 'Enhancements', 'Add valuable enhancements', p2Items)
        );
      }
      if (p3Items.length > 0) {
        phases.push(
          this.createPhase(phases.length + 1, 'Polish', 'Nice-to-have improvements', p3Items)
        );
      }
    } else if (phaseConfig.strategy === 'dependency') {
      // Group by dependency levels
      const levels = this.calculateDependencyLevels(items);
      const maxLevel = Math.max(...Array.from(levels.values()));

      for (let level = 0; level <= maxLevel && phases.length < (phaseConfig.maxPhases || 4); level++) {
        const levelItems = items.filter(i => levels.get(i.id) === level);
        if (levelItems.length > 0) {
          phases.push(
            this.createPhase(
              phases.length + 1,
              `Phase ${phases.length + 1}`,
              `Complete level ${level} dependencies`,
              levelItems
            )
          );
        }
      }
    } else {
      // Timeline-based: Distribute evenly across phases
      const maxPhases = phaseConfig.maxPhases || 4;
      const itemsPerPhase = Math.ceil(items.length / maxPhases);

      for (let i = 0; i < maxPhases && i * itemsPerPhase < items.length; i++) {
        const start = i * itemsPerPhase;
        const end = Math.min(start + itemsPerPhase, items.length);
        const phaseItems = items.slice(start, end);

        phases.push(
          this.createPhase(
            i + 1,
            `Phase ${i + 1}`,
            `Implement ${phaseItems.length} items`,
            phaseItems
          )
        );
      }
    }

    return phases;
  }

  /**
   * Estimate timeline for roadmap
   * @param roadmap - The roadmap
   * @param teamSize - Number of developers
   * @returns Timeline estimate
   */
  estimateTimeline(roadmap: Roadmap, teamSize: number): Timeline {
    const totalHours = roadmap.allItems.reduce((sum, item) => sum + item.effort.hours, 0);

    // Apply team size multiplier
    const multiplier =
      teamSize === 1
        ? EFFORT_MULTIPLIERS.ONE_DEV
        : teamSize === 2
        ? EFFORT_MULTIPLIERS.TWO_DEVS
        : EFFORT_MULTIPLIERS.THREE_DEVS;

    const adjustedHours = totalHours * multiplier;
    const weeks = Math.ceil(adjustedHours / HOURS_PER_WEEK);

    // Calculate phase durations
    const phases = roadmap.phases.map(phase => {
      const phaseHours = phase.items.reduce((sum, item) => sum + item.effort.hours, 0);
      const phaseWeeks = Math.ceil((phaseHours * multiplier) / HOURS_PER_WEEK);

      return {
        phase: phase.number,
        weeks: phaseWeeks,
        hours: Math.round(phaseHours * multiplier),
      };
    });

    // Calculate milestones
    const milestones = this.calculateMilestones(roadmap.phases);

    const startDate = new Date();

    return {
      totalWeeks: weeks,
      totalHours: Math.round(adjustedHours),
      byTeamSize: {
        oneDev: {
          weeks: Math.ceil((totalHours * EFFORT_MULTIPLIERS.ONE_DEV) / HOURS_PER_WEEK),
          completionDate: new Date(startDate.getTime() + Math.ceil((totalHours * EFFORT_MULTIPLIERS.ONE_DEV) / HOURS_PER_WEEK) * 7 * 24 * 60 * 60 * 1000),
          assumptions: ['Full-time developer', '35 hours per week'],
        },
        twoDevs: {
          weeks: Math.ceil((totalHours * EFFORT_MULTIPLIERS.TWO_DEVS) / HOURS_PER_WEEK),
          completionDate: new Date(startDate.getTime() + Math.ceil((totalHours * EFFORT_MULTIPLIERS.TWO_DEVS) / HOURS_PER_WEEK) * 7 * 24 * 60 * 60 * 1000),
          assumptions: ['Two full-time developers', '35 hours per week each'],
        },
        threeDevs: {
          weeks: Math.ceil((totalHours * EFFORT_MULTIPLIERS.THREE_DEVS) / HOURS_PER_WEEK),
          completionDate: new Date(startDate.getTime() + Math.ceil((totalHours * EFFORT_MULTIPLIERS.THREE_DEVS) / HOURS_PER_WEEK) * 7 * 24 * 60 * 60 * 1000),
          assumptions: ['Three full-time developers', '35 hours per week each'],
        },
      },
      criticalPath: {
        items: roadmap.allItems.slice(0, 5),
        durationWeeks: weeks,
      },
      parallelizableWork: {
        items: [],
        durationWeeks: 0,
      },
    };
  }

  /**
   * Convert gaps and features to roadmap items
   * @param gaps - Gaps
   * @param features - Features
   * @returns Roadmap items
   */
  private convertToRoadmapItems(
    gaps: (SpecGap | FeatureGap)[],
    features: ScoredFeature[]
  ): RoadmapItem[] {
    const items: RoadmapItem[] = [];

    // Convert spec gaps
    for (const gap of gaps) {
      if ('requirement' in gap) {
        // SpecGap
        items.push({
          id: gap.id,
          type: 'gap-fix',
          title: gap.description,
          description: gap.impact,
          priority: gap.priority,
          effort: gap.effort,
          phase: 0,
          status: 'not-started',
          tags: ['gap', 'spec', gap.spec],
          dependencies: gap.dependencies,
          blocks: [],
          successCriteria: [],
          acceptanceCriteria: [],
          assignee: undefined,
          source: gap.spec,
        });
      } else {
        // FeatureGap
        items.push({
          id: gap.id,
          type: 'gap-fix',
          title: `Fix: ${gap.advertisedFeature}`,
          description: gap.reality,
          priority: 'P1',
          effort: createEffortEstimate(8, 'medium', 'complexity'),
          phase: 0,
          status: 'not-started',
          tags: ['gap', 'feature', 'documentation'],
          dependencies: [],
          blocks: [],
          successCriteria: [],
          acceptanceCriteria: [],
          assignee: undefined,
          source: gap.claim,
        });
      }
    }

    // Convert scored features
    for (const feature of features) {
      items.push({
        id: uuidv4(),
        type: 'feature',
        title: feature.title,
        description: feature.description,
        priority: feature.priority,
        effort: feature.effort,
        phase: 0,
        status: 'not-started',
        tags: ['feature', 'enhancement', feature.category],
        dependencies: feature.dependencies || [],
        blocks: [],
        successCriteria: [],
        acceptanceCriteria: [],
        assignee: undefined,
        source: feature.category,
      });
    }

    return items;
  }

  /**
   * Create a phase
   * @param number - Phase number
   * @param name - Phase name
   * @param goal - Phase goal
   * @param items - Phase items
   * @returns Phase
   */
  private createPhase(number: number, name: string, goal: string, items: RoadmapItem[]): Phase {
    // Update items with phase number
    items.forEach(item => {
      item.phase = number;
    });

    const totalHours = items.reduce((sum, item) => sum + item.effort.hours, 0);
    const totalEffort = createEffortEstimate(totalHours, 'medium', 'complexity');

    // Calculate duration
    const weeks = Math.ceil(totalHours / HOURS_PER_WEEK);
    const duration = `${weeks} week${weeks !== 1 ? 's' : ''}`;

    // Determine outcome
    const p0Count = items.filter(i => i.priority === 'P0').length;
    const outcome = p0Count > 0
      ? `${p0Count} critical issue${p0Count !== 1 ? 's' : ''} resolved`
      : `${items.length} item${items.length !== 1 ? 's' : ''} completed`;

    // Generate success criteria
    const successCriteria = items
      .filter(i => i.priority === 'P0' || i.priority === 'P1')
      .slice(0, 5)
      .map(i => `${i.title} complete`);

    // Calculate start and end weeks
    const startWeek = number === 1 ? 0 : (number - 1) * weeks;
    const endWeek = startWeek + weeks;

    return {
      number,
      name,
      goal,
      items,
      totalEffort,
      duration,
      startWeek,
      endWeek,
      outcome,
      successCriteria,
      deliverables: items.slice(0, 3).map(i => i.title),
      dependencies: number > 1 ? [number - 1] : [],
    };
  }

  /**
   * Calculate dependency levels for items
   * @param items - Roadmap items
   * @returns Map of item ID to level
   */
  private calculateDependencyLevels(items: RoadmapItem[]): Map<string, number> {
    const levels = new Map<string, number>();
    const itemMap = new Map(items.map(i => [i.id, i]));

    const calculateLevel = (itemId: string, visited: Set<string>): number => {
      if (levels.has(itemId)) {
        return levels.get(itemId)!;
      }

      if (visited.has(itemId)) {
        // Circular dependency, assign high level
        return 999;
      }

      visited.add(itemId);

      const item = itemMap.get(itemId);
      if (!item || !item.dependencies || item.dependencies.length === 0) {
        levels.set(itemId, 0);
        return 0;
      }

      let maxDepLevel = -1;
      for (const depId of item.dependencies) {
        const depLevel = calculateLevel(depId, new Set(visited));
        maxDepLevel = Math.max(maxDepLevel, depLevel);
      }

      const level = maxDepLevel + 1;
      levels.set(itemId, level);
      return level;
    };

    for (const item of items) {
      calculateLevel(item.id, new Set());
    }

    return levels;
  }

  /**
   * Generate roadmap metadata
   */
  private generateMetadata(
    context: ProjectContext,
    gapsCount: number,
    featuresCount: number,
    itemsCount: number
  ): RoadmapMetadata {
    return {
      generated: new Date(),
      projectName: context.name,
      projectPath: context.path,
      toolVersion: '1.0.0',
      analysisBasis: {
        specsAnalyzed: context.specs.length,
        gapsFound: gapsCount,
        featuresIdentified: featuresCount,
        totalItems: itemsCount,
      },
    };
  }

  /**
   * Generate roadmap summary
   */
  private generateSummary(
    items: RoadmapItem[],
    gaps: (SpecGap | FeatureGap)[],
    features: ScoredFeature[],
    context: ProjectContext
  ): RoadmapSummary {
    const specGaps = gaps.filter(g => 'requirement' in g).length;
    const featureGaps = gaps.filter(g => 'advertisedFeature' in g).length;

    const overview = `Project has ${specGaps} spec gaps and ${featureGaps} feature gaps. ` +
      `${features.length} desirable features identified. ` +
      `Total roadmap: ${items.length} items across ${this.config.maxPhases} phases.`;

    // Calculate completion percentages
    const completion = this.calculateCompletion(context);

    // Calculate production readiness
    const productionReadiness = Math.round(
      (completion.categories.coreFeatures * 0.3) +
      (completion.categories.testing * 0.2) +
      (completion.categories.security * 0.2) +
      (completion.categories.documentation * 0.15) +
      (completion.categories.deployment * 0.15)
    );

    const nextSteps = this.generateNextSteps(items);

    return {
      overview,
      currentState: `${specGaps} spec gaps, ${featureGaps} feature gaps identified`,
      targetState: `All ${items.length} items completed across ${this.config.maxPhases} phases`,
      completion: completion as any,
      highlights: [
        `${items.filter(i => i.priority === 'P0').length} critical (P0) items`,
        `${items.filter(i => i.priority === 'P1').length} high-priority (P1) items`,
        `${features.length} new features brainstormed`,
      ],
      nextSteps,
      byPriority: {
        p0Count: items.filter(i => i.priority === 'P0').length,
        p1Count: items.filter(i => i.priority === 'P1').length,
        p2Count: items.filter(i => i.priority === 'P2').length,
      },
    };
  }

  /**
   * Calculate completion percentages
   */
  private calculateCompletion(context: ProjectContext): any {
    // This is a placeholder - real implementation would analyze actual completion
    return {
      overall: 40,
      categories: {
        coreFeatures: 45,
        documentation: 60,
        testing: 30,
        security: 35,
        deployment: 50,
        errorHandling: 40,
        performance: 45,
      },
      productionReadiness: 42,
    };
  }

  /**
   * Generate next steps
   */
  private generateNextSteps(items: RoadmapItem[]): string[] {
    const p0Items = items.filter(i => i.priority === 'P0');
    const p1Items = items.filter(i => i.priority === 'P1');

    const steps: string[] = [];

    if (p0Items.length > 0) {
      steps.push(`Address ${p0Items.length} critical (P0) issues immediately`);
    }

    if (p1Items.length > 0) {
      steps.push(`Plan implementation of ${p1Items.length} high-priority (P1) items`);
    }

    steps.push('Review and prioritize roadmap with team');
    steps.push('Set up project tracking in GitHub Issues or similar');
    steps.push('Begin Phase 1 implementation');

    return steps;
  }

  /**
   * Group items by priority
   */
  private groupByPriority(items: RoadmapItem[]): any {
    const p0 = items.filter(i => i.priority === 'P0');
    const p1 = items.filter(i => i.priority === 'P1');
    const p2 = items.filter(i => i.priority === 'P2');
    const p3 = items.filter(i => i.priority === 'P3');

    const sumEffort = (items: RoadmapItem[]) =>
      items.reduce((sum, i) => sum + i.effort.hours, 0);

    return {
      p0: {
        count: p0.length,
        effort: createEffortEstimate(sumEffort(p0), 'medium', 'complexity'),
        items: p0,
      },
      p1: {
        count: p1.length,
        effort: createEffortEstimate(sumEffort(p1), 'medium', 'complexity'),
        items: p1,
      },
      p2: {
        count: p2.length,
        effort: createEffortEstimate(sumEffort(p2), 'medium', 'complexity'),
        items: p2,
      },
      p3: {
        count: p3.length,
        effort: createEffortEstimate(sumEffort(p3), 'medium', 'complexity'),
        items: p3,
      },
    };
  }

  /**
   * Identify risks
   */
  private identifyRisks(items: RoadmapItem[], context: ProjectContext): Risk[] {
    const risks: Risk[] = [];

    // Check for high-effort items
    const highEffortItems = items.filter(i => i.effort.hours > 40);
    if (highEffortItems.length > 0) {
      risks.push({
        id: uuidv4(),
        title: 'High-effort items may take longer than estimated',
        description: `${highEffortItems.length} items require more than 40 hours of effort`,
        likelihood: 'medium',
        impact: 'high',
        severity: 'medium',
        mitigations: ['Break down large items into smaller tasks', 'Add buffer time'],
        affectedItems: highEffortItems.map(i => i.id),
      });
    }

    // Check for complex dependencies
    const complexDeps = items.filter(i => i.dependencies && i.dependencies.length > 2);
    if (complexDeps.length > 0) {
      risks.push({
        id: uuidv4(),
        title: 'Complex dependencies may cause delays',
        description: `${complexDeps.length} items have complex dependency chains`,
        likelihood: 'medium',
        impact: 'medium',
        severity: 'medium',
        mitigations: ['Identify critical path', 'Start independent items in parallel'],
        affectedItems: complexDeps.map(i => i.id),
      });
    }

    return risks;
  }

  /**
   * Extract dependencies
   */
  private extractDependencies(items: RoadmapItem[]): Dependency[] {
    const dependencies: Dependency[] = [];
    const itemMap = new Map(items.map(i => [i.id, i]));

    for (const item of items) {
      if (item.dependencies) {
        for (const depId of item.dependencies) {
          const depItem = itemMap.get(depId);
          if (depItem) {
            dependencies.push({
              dependent: item.title,
              dependsOn: depItem.title,
              type: 'prerequisite',
              reason: `${item.title} requires ${depItem.title} to be complete`,
              isHard: true,
            });
          }
        }
      }
    }

    return dependencies;
  }

  /**
   * Generate success criteria
   */
  private generateSuccessCriteria(items: RoadmapItem[], context: ProjectContext): string[] {
    const criteria: string[] = [];

    const p0Count = items.filter(i => i.priority === 'P0').length;
    if (p0Count > 0) {
      criteria.push(`All ${p0Count} P0 critical issues resolved`);
    }

    const p1Count = items.filter(i => i.priority === 'P1').length;
    if (p1Count > 0) {
      criteria.push(`${p1Count} P1 high-priority features implemented`);
    }

    criteria.push('All tests passing with >80% coverage');
    criteria.push('Documentation updated and accurate');
    criteria.push('Production deployment successful');

    return criteria;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(items: RoadmapItem[], context: ProjectContext): string[] {
    const recommendations: string[] = [];

    const p0Count = items.filter(i => i.priority === 'P0').length;
    if (p0Count > 3) {
      recommendations.push('Consider addressing P0 items before adding new features');
    }

    const gapCount = items.filter(i => i.type === 'gap-fix').length;
    if (gapCount > items.length * 0.5) {
      recommendations.push('Focus on gap fixes to improve reliability before adding features');
    }

    recommendations.push('Review roadmap quarterly and adjust priorities based on progress');
    recommendations.push('Track velocity to improve future estimates');

    return recommendations;
  }

  /**
   * Calculate milestones
   */
  private calculateMilestones(phases: Phase[]): Array<{ phase: number; name: string; week: number }> {
    const milestones: Array<{ phase: number; name: string; week: number }> = [];
    let cumulativeWeeks = 0;

    for (const phase of phases) {
      const weeks = parseInt(phase.duration.split(' ')[0]);
      cumulativeWeeks += weeks;

      milestones.push({
        phase: phase.number,
        name: `Complete ${phase.name}`,
        week: cumulativeWeeks,
      });
    }

    return milestones;
  }

  /**
   * Log message if verbose
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[RoadmapGenerator] ${message}`);
    }
  }
}

/**
 * Create a RoadmapGenerator instance
 */
export function createRoadmapGenerator(config?: RoadmapConfig): RoadmapGenerator {
  return new RoadmapGenerator(config);
}
