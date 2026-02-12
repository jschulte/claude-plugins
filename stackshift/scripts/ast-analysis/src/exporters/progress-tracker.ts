/**
 * Progress Tracker
 * Tracks roadmap progress over time and calculates deltas
 * Implements part of User Story 5 (FR5): Progress Tracking
 */

import * as fs from 'fs/promises';
import type {
  Roadmap,
  RoadmapItem,
  Phase,
} from '../types/roadmap.js';

/**
 * Roadmap Progress
 */
export interface RoadmapProgress {
  roadmap: Roadmap;
  timestamp: string;
  percentComplete: number;
  itemsComplete: number;
  itemsTotal: number;
  velocity: number; // items per week
  estimatedCompletion: Date;
  history: ProgressSnapshot[];
}

/**
 * Progress Snapshot
 */
export interface ProgressSnapshot {
  timestamp: string;
  percentComplete: number;
  itemsComplete: number;
  itemsTotal: number;
}

/**
 * Roadmap Delta
 */
export interface RoadmapDelta {
  added: RoadmapItem[];
  removed: RoadmapItem[];
  completed: RoadmapItem[];
  regressions: RoadmapItem[];
  modified: Array<{
    item: RoadmapItem;
    changes: string[];
  }>;
}

/**
 * Progress Tracker
 * Tracks roadmap progress and changes over time
 */
export class ProgressTracker {
  /**
   * Load current progress from roadmap file
   * @param roadmapPath - Path to ROADMAP.md
   * @returns Current progress
   */
  async loadProgress(roadmapPath: string): Promise<RoadmapProgress> {
    try {
      // Try to load existing progress
      const progressPath = roadmapPath.replace(/\.md$/, '.progress.json');
      const content = await fs.readFile(progressPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // No existing progress, return empty
      return {
        roadmap: {} as Roadmap,
        timestamp: new Date().toISOString(),
        percentComplete: 0,
        itemsComplete: 0,
        itemsTotal: 0,
        velocity: 0,
        estimatedCompletion: new Date(),
        history: [],
      };
    }
  }

  /**
   * Update progress with new roadmap
   * @param oldProgress - Previous progress
   * @param newRoadmap - Updated roadmap
   * @returns Updated progress
   */
  async updateProgress(
    oldProgress: RoadmapProgress,
    newRoadmap: Roadmap
  ): Promise<RoadmapProgress> {
    const itemsComplete = this.countCompleteItems(newRoadmap);
    const itemsTotal = newRoadmap.allItems.length;
    const percentComplete = itemsTotal > 0 ? Math.round((itemsComplete / itemsTotal) * 100) : 0;

    // Add current state to history
    const history = [
      ...oldProgress.history,
      {
        timestamp: oldProgress.timestamp,
        percentComplete: oldProgress.percentComplete,
        itemsComplete: oldProgress.itemsComplete,
        itemsTotal: oldProgress.itemsTotal,
      },
    ];

    // Calculate velocity
    const velocity = this.calculateVelocity({ ...oldProgress, history });

    // Estimate completion
    const estimatedCompletion = this.estimateCompletion({
      ...oldProgress,
      velocity,
      itemsComplete,
      itemsTotal,
    } as any);

    return {
      roadmap: newRoadmap,
      timestamp: new Date().toISOString(),
      percentComplete,
      itemsComplete,
      itemsTotal,
      velocity,
      estimatedCompletion,
      history,
    };
  }

  /**
   * Calculate delta between roadmap versions
   * @param oldRoadmap - Previous roadmap
   * @param newRoadmap - Current roadmap
   * @returns Delta with changes
   */
  async calculateDelta(oldRoadmap: Roadmap, newRoadmap: Roadmap): Promise<RoadmapDelta> {
    const oldItems = new Map(oldRoadmap.allItems.map(i => [i.id, i]));
    const newItems = new Map(newRoadmap.allItems.map(i => [i.id, i]));

    const delta: RoadmapDelta = {
      added: [],
      removed: [],
      completed: [],
      regressions: [],
      modified: [],
    };

    // Find added items
    for (const [id, item] of newItems) {
      if (!oldItems.has(id)) {
        delta.added.push(item);
      }
    }

    // Find removed items and check for completions/regressions
    for (const [id, oldItem] of oldItems) {
      const newItem = newItems.get(id);

      if (!newItem) {
        delta.removed.push(oldItem);
      } else {
        // Check for status changes
        if (oldItem.status !== 'completed' && newItem.status === 'completed') {
          delta.completed.push(newItem);
        } else if (oldItem.status === 'completed' && newItem.status !== 'completed') {
          delta.regressions.push(newItem);
        }

        // Check for other modifications
        const changes = this.detectChanges(oldItem, newItem);
        if (changes.length > 0) {
          delta.modified.push({ item: newItem, changes });
        }
      }
    }

    return delta;
  }

  /**
   * Calculate velocity (items completed per week)
   * @param progress - Current progress
   * @returns Velocity
   */
  calculateVelocity(progress: RoadmapProgress): number {
    if (progress.history.length < 2) {
      return 0; // Not enough data
    }

    // Look at last 4 snapshots (or all if less)
    const recentHistory = progress.history.slice(-4);

    // Calculate items completed between snapshots
    const completions: number[] = [];
    for (let i = 1; i < recentHistory.length; i++) {
      const prev = recentHistory[i - 1];
      const curr = recentHistory[i];
      const itemsCompleted = curr.itemsComplete - prev.itemsComplete;
      completions.push(itemsCompleted);
    }

    // Calculate average
    const avgItemsPerSnapshot = completions.reduce((a, b) => a + b, 0) / completions.length;

    // Assume snapshots are weekly (adjust if needed)
    const weeksPerSnapshot = 1;

    return avgItemsPerSnapshot / weeksPerSnapshot;
  }

  /**
   * Estimate completion date based on velocity
   * @param progress - Current progress
   * @returns Estimated completion date
   */
  estimateCompletion(progress: RoadmapProgress): Date {
    const itemsRemaining = progress.itemsTotal - progress.itemsComplete;

    if (itemsRemaining <= 0) {
      return new Date(); // Already complete
    }

    if (progress.velocity <= 0) {
      // No velocity data, estimate based on effort
      const totalHours = progress.roadmap.allItems
        .filter(i => i.status !== 'completed')
        .reduce((sum, i) => sum + i.effort.hours, 0);

      const weeks = Math.ceil(totalHours / 35); // 35 hours per week
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() + weeks * 7);
      return completionDate;
    }

    // Estimate based on velocity
    const weeksRemaining = Math.ceil(itemsRemaining / progress.velocity);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + weeksRemaining * 7);

    return completionDate;
  }

  /**
   * Save progress to file
   * @param progress - Progress to save
   * @param filePath - Path to save to
   */
  async saveProgress(progress: RoadmapProgress, filePath: string): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(progress, null, 2), 'utf-8');
  }

  /**
   * Generate progress report
   * @param progress - Current progress
   * @param delta - Changes since last update
   * @returns Markdown report
   */
  generateProgressReport(progress: RoadmapProgress, delta?: RoadmapDelta): string {
    const parts: string[] = [];

    parts.push('# Roadmap Progress Report\n');
    parts.push(`**Generated:** ${new Date(progress.timestamp).toLocaleDateString()}\n`);

    // Overall progress
    parts.push('## Overall Progress\n');
    parts.push(`- **Completion:** ${progress.percentComplete}%`);
    parts.push(`- **Items Complete:** ${progress.itemsComplete} / ${progress.itemsTotal}`);
    parts.push(`- **Velocity:** ${progress.velocity.toFixed(1)} items/week`);
    parts.push(
      `- **Estimated Completion:** ${progress.estimatedCompletion.toLocaleDateString()}\n`
    );

    // Delta (if provided)
    if (delta) {
      parts.push('## Recent Changes\n');

      if (delta.completed.length > 0) {
        parts.push(`### ✅ Completed (${delta.completed.length})\n`);
        for (const item of delta.completed.slice(0, 10)) {
          parts.push(`- ${item.title}`);
        }
        parts.push('');
      }

      if (delta.added.length > 0) {
        parts.push(`### ➕ Added (${delta.added.length})\n`);
        for (const item of delta.added.slice(0, 10)) {
          parts.push(`- ${item.title}`);
        }
        parts.push('');
      }

      if (delta.removed.length > 0) {
        parts.push(`### ➖ Removed (${delta.removed.length})\n`);
        for (const item of delta.removed.slice(0, 10)) {
          parts.push(`- ${item.title}`);
        }
        parts.push('');
      }

      if (delta.regressions.length > 0) {
        parts.push(`### ⚠️  Regressions (${delta.regressions.length})\n`);
        for (const item of delta.regressions) {
          parts.push(`- ${item.title}`);
        }
        parts.push('');
      }
    }

    // Progress history
    if (progress.history.length > 0) {
      parts.push('## Progress History\n');
      parts.push('| Date | Complete | Total | % |');
      parts.push('|------|----------|-------|---|');

      for (const snapshot of progress.history.slice(-10).reverse()) {
        const date = new Date(snapshot.timestamp).toLocaleDateString();
        parts.push(
          `| ${date} | ${snapshot.itemsComplete} | ${snapshot.itemsTotal} | ${snapshot.percentComplete}% |`
        );
      }
      parts.push('');
    }

    return parts.join('\n');
  }

  /**
   * Count completed items in roadmap
   * @param roadmap - Roadmap
   * @returns Number of completed items
   */
  private countCompleteItems(roadmap: Roadmap): number {
    return roadmap.allItems.filter(i => i.status === 'completed').length;
  }

  /**
   * Detect changes between two items
   * @param oldItem - Old item
   * @param newItem - New item
   * @returns Array of change descriptions
   */
  private detectChanges(oldItem: RoadmapItem, newItem: RoadmapItem): string[] {
    const changes: string[] = [];

    if (oldItem.title !== newItem.title) {
      changes.push(`Title changed from "${oldItem.title}" to "${newItem.title}"`);
    }

    if (oldItem.priority !== newItem.priority) {
      changes.push(`Priority changed from ${oldItem.priority} to ${newItem.priority}`);
    }

    if (oldItem.phase !== newItem.phase) {
      changes.push(`Phase changed from ${oldItem.phase} to ${newItem.phase}`);
    }

    if (oldItem.effort.hours !== newItem.effort.hours) {
      changes.push(`Effort changed from ${oldItem.effort.hours}h to ${newItem.effort.hours}h`);
    }

    if (oldItem.assignee !== newItem.assignee) {
      changes.push(`Assignee changed from ${oldItem.assignee || 'none'} to ${newItem.assignee || 'none'}`);
    }

    return changes;
  }
}

/**
 * Create a ProgressTracker instance
 */
export function createProgressTracker(): ProgressTracker {
  return new ProgressTracker();
}
