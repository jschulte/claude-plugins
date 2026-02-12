import { describe, it, expect } from 'vitest';
import { Prioritizer, createPrioritizer } from '../prioritizer.js';
import type { RoadmapItem, Priority } from '../../types/roadmap.js';
import { createEffortEstimate } from '../../types/roadmap.js';

function makeItem(overrides: Partial<RoadmapItem> & { id: string; priority: Priority }): RoadmapItem {
  return {
    type: 'gap-fix',
    title: `Item ${overrides.id}`,
    description: '',
    effort: createEffortEstimate(8, 'medium', 'ai'),
    phase: 1,
    status: 'not-started',
    dependencies: [],
    blocks: [],
    successCriteria: [],
    acceptanceCriteria: [],
    tags: [],
    ...overrides,
  };
}

describe('Prioritizer', () => {
  const prioritizer = new Prioritizer();

  describe('detectCircularDependencies', () => {
    it('returns empty array when no cycles', () => {
      const items = [
        makeItem({ id: 'A', priority: 'P0', dependencies: [] }),
        makeItem({ id: 'B', priority: 'P1', dependencies: ['A'] }),
        makeItem({ id: 'C', priority: 'P2', dependencies: ['B'] }),
      ];
      expect(prioritizer.detectCircularDependencies(items)).toHaveLength(0);
    });

    it('detects a simple cycle A -> B -> A', () => {
      const items = [
        makeItem({ id: 'A', priority: 'P0', dependencies: ['B'] }),
        makeItem({ id: 'B', priority: 'P1', dependencies: ['A'] }),
      ];
      const cycles = prioritizer.detectCircularDependencies(items);
      expect(cycles.length).toBeGreaterThan(0);
    });

    it('detects a longer cycle A -> B -> C -> A', () => {
      const items = [
        makeItem({ id: 'A', priority: 'P0', dependencies: ['C'] }),
        makeItem({ id: 'B', priority: 'P1', dependencies: ['A'] }),
        makeItem({ id: 'C', priority: 'P2', dependencies: ['B'] }),
      ];
      const cycles = prioritizer.detectCircularDependencies(items);
      expect(cycles.length).toBeGreaterThan(0);
    });

    it('handles items with no dependencies', () => {
      const items = [
        makeItem({ id: 'A', priority: 'P0' }),
        makeItem({ id: 'B', priority: 'P1' }),
      ];
      expect(prioritizer.detectCircularDependencies(items)).toHaveLength(0);
    });
  });

  describe('groupByPriority', () => {
    it('groups items by their priority', () => {
      const items = [
        makeItem({ id: '1', priority: 'P0' }),
        makeItem({ id: '2', priority: 'P1' }),
        makeItem({ id: '3', priority: 'P0' }),
        makeItem({ id: '4', priority: 'P2' }),
      ];
      const groups = prioritizer.groupByPriority(items);
      expect(groups.get('P0')!.length).toBe(2);
      expect(groups.get('P1')!.length).toBe(1);
      expect(groups.get('P2')!.length).toBe(1);
      expect(groups.has('P3')).toBe(false);
    });

    it('returns empty map for empty input', () => {
      const groups = prioritizer.groupByPriority([]);
      expect(groups.size).toBe(0);
    });
  });

  describe('findReadyItems', () => {
    it('returns items with no dependencies', () => {
      const items = [
        makeItem({ id: 'A', priority: 'P0', dependencies: [] }),
        makeItem({ id: 'B', priority: 'P1', dependencies: ['A'] }),
      ];
      const ready = prioritizer.findReadyItems(items, new Set());
      expect(ready).toHaveLength(1);
      expect(ready[0].id).toBe('A');
    });

    it('returns items whose dependencies are all completed', () => {
      const items = [
        makeItem({ id: 'A', priority: 'P0', dependencies: [] }),
        makeItem({ id: 'B', priority: 'P1', dependencies: ['A'] }),
      ];
      const ready = prioritizer.findReadyItems(items, new Set(['A']));
      expect(ready).toHaveLength(2);
    });

    it('excludes items with unmet dependencies', () => {
      const items = [
        makeItem({ id: 'A', priority: 'P0', dependencies: ['X'] }),
      ];
      const ready = prioritizer.findReadyItems(items, new Set());
      expect(ready).toHaveLength(0);
    });

    it('handles all items ready', () => {
      const items = [
        makeItem({ id: 'A', priority: 'P0' }),
        makeItem({ id: 'B', priority: 'P1' }),
      ];
      const ready = prioritizer.findReadyItems(items, new Set());
      expect(ready).toHaveLength(2);
    });
  });

  describe('resolveDependencies', () => {
    it('returns items in dependency order', async () => {
      const items = [
        makeItem({ id: 'C', priority: 'P2', dependencies: ['B'] }),
        makeItem({ id: 'A', priority: 'P0', dependencies: [] }),
        makeItem({ id: 'B', priority: 'P1', dependencies: ['A'] }),
      ];
      const sorted = await prioritizer.resolveDependencies(items);
      const ids = sorted.map(i => i.id);
      expect(ids.indexOf('A')).toBeLessThan(ids.indexOf('B'));
      expect(ids.indexOf('B')).toBeLessThan(ids.indexOf('C'));
    });

    it('handles items with circular deps without crashing', async () => {
      const items = [
        makeItem({ id: 'A', priority: 'P0', dependencies: ['B'] }),
        makeItem({ id: 'B', priority: 'P1', dependencies: ['A'] }),
      ];
      const sorted = await prioritizer.resolveDependencies(items);
      expect(sorted).toHaveLength(2);
    });
  });

  describe('prioritize', () => {
    it('sorts P0 items before P3 items', async () => {
      const context = {
        path: '/test', name: 'test', language: 'typescript',
        techStack: [], frameworks: [], currentFeatures: [],
        route: 'greenfield' as const, linesOfCode: 1000, fileCount: 10,
        specs: [], docs: [],
      };
      const items = [
        makeItem({ id: '1', priority: 'P3' }),
        makeItem({ id: '2', priority: 'P0' }),
      ];
      const result = await prioritizer.prioritize(items, context);
      expect(result[0].priority).toBe('P0');
    });
  });

  describe('createPrioritizer', () => {
    it('returns a Prioritizer instance', () => {
      const p = createPrioritizer();
      expect(p).toBeInstanceOf(Prioritizer);
    });

    it('accepts config options', () => {
      const p = createPrioritizer({ strategy: 'effort', verbose: false });
      expect(p).toBeInstanceOf(Prioritizer);
    });
  });
});
