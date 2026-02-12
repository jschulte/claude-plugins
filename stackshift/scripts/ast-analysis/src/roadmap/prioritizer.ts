/**
 * Roadmap Prioritizer
 * Prioritizes and orders roadmap items based on dependencies and importance
 */

import type { RoadmapItem, ProjectContext, Priority } from '../types/roadmap.js';
import { comparePriorities, getPriorityLevel } from '../types/roadmap.js';

/**
 * Prioritizer Configuration
 */
export interface PrioritizerConfig {
  /**
   * Strategy for prioritization
   */
  strategy?: 'priority' | 'effort' | 'impact' | 'balanced';

  /**
   * Verbose logging
   */
  verbose?: boolean;
}

const DEFAULT_CONFIG: Required<PrioritizerConfig> = {
  strategy: 'balanced',
  verbose: false,
};

/**
 * Prioritizer
 * Handles prioritization and dependency resolution for roadmap items
 */
export class Prioritizer {
  private config: Required<PrioritizerConfig>;

  constructor(config: PrioritizerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Assign priorities to roadmap items
   * @param items - Items to prioritize
   * @param context - Project context
   * @returns Prioritized items
   */
  async prioritize(items: RoadmapItem[], context: ProjectContext): Promise<RoadmapItem[]> {
    this.log(`Prioritizing ${items.length} items using ${this.config.strategy} strategy`);

    // Calculate priority scores
    const scoredItems = items.map(item => ({
      item,
      score: this.calculatePriorityScore(item, context),
    }));

    // Sort by score (higher = more important)
    scoredItems.sort((a, b) => b.score - a.score);

    this.log(`Prioritization complete`);

    return scoredItems.map(si => si.item);
  }

  /**
   * Resolve dependencies and order items
   * @param items - Items with dependencies
   * @returns Topologically sorted items
   */
  async resolveDependencies(items: RoadmapItem[]): Promise<RoadmapItem[]> {
    this.log(`Resolving dependencies for ${items.length} items`);

    // Check for circular dependencies first
    const circular = this.detectCircularDependencies(items);
    if (circular.length > 0) {
      this.log(`Warning: Found ${circular.length} circular dependency chains`);
      for (const chain of circular) {
        this.log(`  Circular: ${chain.join(' → ')}`);
      }
    }

    // Build dependency graph
    const graph = this.buildDependencyGraph(items);

    // Perform topological sort
    const sorted = this.topologicalSort(graph, items);

    this.log(`Dependency resolution complete`);

    return sorted;
  }

  /**
   * Detect circular dependencies
   * @param items - Items to check
   * @returns Circular dependency chains (empty if none)
   */
  detectCircularDependencies(items: RoadmapItem[]): string[][] {
    const circular: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const itemMap = new Map(items.map(item => [item.id, item]));

    const dfs = (itemId: string, path: string[]): void => {
      visited.add(itemId);
      recursionStack.add(itemId);
      path.push(itemId);

      const item = itemMap.get(itemId);
      if (item) {
        for (const depId of item.dependencies || []) {
          if (!visited.has(depId)) {
            dfs(depId, [...path]);
          } else if (recursionStack.has(depId)) {
            // Found a cycle
            const cycleStart = path.indexOf(depId);
            if (cycleStart !== -1) {
              circular.push([...path.slice(cycleStart), depId]);
            }
          }
        }
      }

      recursionStack.delete(itemId);
    };

    for (const item of items) {
      if (!visited.has(item.id)) {
        dfs(item.id, []);
      }
    }

    return circular;
  }

  /**
   * Calculate priority score for an item
   * @param item - Roadmap item
   * @param context - Project context
   * @returns Priority score (higher = more important)
   */
  private calculatePriorityScore(item: RoadmapItem, context: ProjectContext): number {
    let score = 0;

    // Base score from priority level
    const priorityScores: Record<Priority, number> = {
      P0: 1000,
      P1: 500,
      P2: 100,
      P3: 10,
    };
    score += priorityScores[item.priority];

    if (this.config.strategy === 'effort') {
      // Prefer lower effort items
      score -= item.effort.hours * 2;
    } else if (this.config.strategy === 'impact') {
      // Prefer high-impact items
      if (item.type === 'gap-fix') {
        score += 200; // Fixing gaps is high impact
      }
      if (item.dependencies && item.dependencies.length > 0) {
        score += 100; // Items with dependents are high impact
      }
    } else if (this.config.strategy === 'balanced') {
      // Balance between priority, effort, and impact
      if (item.type === 'gap-fix') {
        score += 100;
      }

      // Prefer moderate effort items (not too easy, not too hard)
      const effortPenalty = Math.abs(item.effort.hours - 8) * 2;
      score -= effortPenalty;

      // Boost for items that unblock others
      const dependentCount = (items: RoadmapItem[]) =>
        items.filter((i: RoadmapItem) => i.dependencies?.includes(item.id)).length;
      // Note: This would require context, so we'll estimate
      if (item.dependencies && item.dependencies.length === 0) {
        score += 50; // No dependencies = can start immediately
      }
    }

    return score;
  }

  /**
   * Build dependency graph
   * @param items - Roadmap items
   * @returns Adjacency list representation
   */
  private buildDependencyGraph(items: RoadmapItem[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    for (const item of items) {
      if (!graph.has(item.id)) {
        graph.set(item.id, []);
      }

      // Add edges for dependencies
      if (item.dependencies) {
        for (const depId of item.dependencies) {
          if (!graph.has(depId)) {
            graph.set(depId, []);
          }
          graph.get(depId)!.push(item.id);
        }
      }
    }

    return graph;
  }

  /**
   * Topological sort using Kahn's algorithm
   * @param graph - Dependency graph
   * @param items - Roadmap items
   * @returns Sorted items
   */
  private topologicalSort(graph: Map<string, string[]>, items: RoadmapItem[]): RoadmapItem[] {
    const itemMap = new Map(items.map(item => [item.id, item]));
    const inDegree = new Map<string, number>();
    const sorted: RoadmapItem[] = [];

    // Initialize in-degrees
    for (const item of items) {
      inDegree.set(item.id, 0);
    }

    // Calculate in-degrees (each dependency adds an incoming edge to the dependent item)
    for (const item of items) {
      if (item.dependencies) {
        for (const _depId of item.dependencies) {
          inDegree.set(item.id, (inDegree.get(item.id) || 0) + 1);
        }
      }
    }

    // Queue items with no dependencies
    const queue: string[] = [];
    for (const [id, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(id);
      }
    }

    // Sort by priority within same level
    queue.sort((a, b) => {
      const itemA = itemMap.get(a);
      const itemB = itemMap.get(b);
      if (!itemA || !itemB) return 0;
      return comparePriorities(itemA.priority, itemB.priority);
    });

    // Process queue
    while (queue.length > 0) {
      const id = queue.shift()!;
      const item = itemMap.get(id);

      if (item) {
        sorted.push(item);
      }

      // Reduce in-degree for dependent items
      const dependents = graph.get(id) || [];
      for (const depId of dependents) {
        const newDegree = (inDegree.get(depId) || 0) - 1;
        inDegree.set(depId, newDegree);

        if (newDegree === 0) {
          queue.push(depId);
        }
      }

      // Sort queue by priority
      queue.sort((a, b) => {
        const itemA = itemMap.get(a);
        const itemB = itemMap.get(b);
        if (!itemA || !itemB) return 0;
        return comparePriorities(itemA.priority, itemB.priority);
      });
    }

    // If not all items were sorted, there's a cycle
    // Add remaining items at the end
    if (sorted.length < items.length) {
      const sortedIds = new Set(sorted.map(i => i.id));
      const remaining = items.filter(i => !sortedIds.has(i.id));
      sorted.push(...remaining);

      this.log(`Warning: Could not fully resolve dependencies (${remaining.length} items remain)`);
    }

    return sorted;
  }

  /**
   * Group items by priority
   * @param items - Roadmap items
   * @returns Items grouped by priority
   */
  groupByPriority(items: RoadmapItem[]): Map<Priority, RoadmapItem[]> {
    const groups = new Map<Priority, RoadmapItem[]>();

    for (const item of items) {
      if (!groups.has(item.priority)) {
        groups.set(item.priority, []);
      }
      groups.get(item.priority)!.push(item);
    }

    return groups;
  }

  /**
   * Find items that can be worked on now (no unmet dependencies)
   * @param items - All roadmap items
   * @param completedIds - IDs of completed items
   * @returns Items that can start now
   */
  findReadyItems(items: RoadmapItem[], completedIds: Set<string>): RoadmapItem[] {
    return items.filter(item => {
      if (!item.dependencies || item.dependencies.length === 0) {
        return true;
      }

      // Check if all dependencies are complete
      return item.dependencies.every(depId => completedIds.has(depId));
    });
  }

  /**
   * Log message if verbose
   * @param message - Message to log
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[Prioritizer] ${message}`);
    }
  }
}

/**
 * Create a Prioritizer instance
 */
export function createPrioritizer(config?: PrioritizerConfig): Prioritizer {
  return new Prioritizer(config);
}
