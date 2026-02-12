import { describe, it, expect } from 'vitest';
import { ScoringEngine, createScoringEngine } from '../scoring-engine.js';
import type { DesirableFeature, ProjectContext } from '../../types/roadmap.js';
import { createEffortEstimate } from '../../types/roadmap.js';

function makeFeature(overrides: Partial<DesirableFeature> = {}): DesirableFeature {
  return {
    id: 'F001',
    category: 'core-functionality',
    name: 'test-feature',
    title: 'Test Feature',
    description: 'A test feature for scoring',
    rationale: 'Testing',
    value: 'High',
    effort: createEffortEstimate(8, 'medium', 'ai'),
    priority: 'P2',
    dependencies: [],
    alternatives: [],
    risks: [],
    source: 'ai-generated',
    strategicAlignment: 5,
    ...overrides,
  };
}

function makeContext(overrides: Partial<ProjectContext> = {}): ProjectContext {
  return {
    path: '/test',
    name: 'test-project',
    language: 'typescript',
    techStack: ['node'],
    frameworks: ['React'],
    currentFeatures: [],
    route: 'greenfield',
    linesOfCode: 10000,
    fileCount: 100,
    specs: [],
    docs: [],
    ...overrides,
  };
}

describe('ScoringEngine', () => {
  const engine = new ScoringEngine();
  const context = makeContext();

  describe('scoreImpact', () => {
    it('gives higher score for security features', () => {
      const securityFeature = makeFeature({ title: 'Fix security vulnerability', description: 'Patch XSS', category: 'testing' });
      const normalFeature = makeFeature({ title: 'Add tooltip', description: 'UI tooltip', category: 'testing' });
      expect(engine.scoreImpact(securityFeature, context)).toBeGreaterThan(engine.scoreImpact(normalFeature, context));
    });

    it('gives higher score for core-functionality category', () => {
      const core = makeFeature({ category: 'core-functionality' });
      const docs = makeFeature({ category: 'documentation' });
      expect(engine.scoreImpact(core, context)).toBeGreaterThan(engine.scoreImpact(docs, context));
    });

    it('clamps between 1 and 10', () => {
      const feature = makeFeature({ title: 'security vulnerability data loss crash bug', description: 'critical' });
      const score = engine.scoreImpact(feature, context);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    });

    it('factors in strategic alignment', () => {
      const aligned = makeFeature({ strategicAlignment: 10 });
      const unaligned = makeFeature({ strategicAlignment: 0 });
      expect(engine.scoreImpact(aligned, context)).toBeGreaterThanOrEqual(engine.scoreImpact(unaligned, context));
    });
  });

  describe('scoreEffort', () => {
    it('gives higher effort score for AI/ML features', () => {
      const aiFeature = makeFeature({ title: 'AI-powered machine learning model', description: 'distributed' });
      const simpleFeature = makeFeature({ title: 'Simple logging fix', description: 'basic' });
      expect(engine.scoreEffort(aiFeature, context)).toBeGreaterThan(engine.scoreEffort(simpleFeature, context));
    });

    it('reduces effort for familiar tech stack', () => {
      const tsFeature = makeFeature({ title: 'TypeScript refactor', description: 'typescript migration' });
      const tsContext = makeContext({ language: 'typescript' });
      const pyContext = makeContext({ language: 'python' });
      expect(engine.scoreEffort(tsFeature, tsContext)).toBeLessThanOrEqual(engine.scoreEffort(tsFeature, pyContext));
    });

    it('clamps between 1 and 10', () => {
      const feature = makeFeature({ title: 'simple basic documentation readme', description: 'simple' });
      const score = engine.scoreEffort(feature, context);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    });
  });

  describe('calculateROI', () => {
    it('returns impact/effort ratio', () => {
      expect(engine.calculateROI(8, 4)).toBe(2);
    });

    it('handles zero effort', () => {
      expect(engine.calculateROI(5, 0)).toBe(50);
    });

    it('returns fraction for low impact high effort', () => {
      expect(engine.calculateROI(2, 8)).toBe(0.25);
    });
  });

  describe('scoreStrategicValue', () => {
    it('boosts AI/LLM features', () => {
      const aiFeature = makeFeature({ title: 'AI assistant with LLM', description: 'cloud integration' });
      const plainFeature = makeFeature({ title: 'Color picker', description: 'choose colors' });
      expect(engine.scoreStrategicValue(aiFeature, context)).toBeGreaterThan(engine.scoreStrategicValue(plainFeature, context));
    });

    it('clamps between 1 and 10', () => {
      const feature = makeFeature({ title: 'AI LLM cloud real-time innovative unique competitive requested', description: 'everything' });
      const score = engine.scoreStrategicValue(feature, context);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    });
  });

  describe('scoreRisk', () => {
    it('gives higher risk for breaking changes', () => {
      const breaking = makeFeature({ title: 'Breaking migration', description: 'database schema change' });
      const safe = makeFeature({ title: 'Add tooltip', description: 'display help text' });
      expect(engine.scoreRisk(breaking, context)).toBeGreaterThan(engine.scoreRisk(safe, context));
    });

    it('clamps between 1 and 10', () => {
      const feature = makeFeature({ title: 'breaking experimental security change database schema authentication payment', description: 'risky' });
      const score = engine.scoreRisk(feature, context);
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    });
  });

  describe('scoreFeatures', () => {
    it('sorts features by priority score descending', async () => {
      const features = [
        makeFeature({ id: 'F001', title: 'Low impact doc', category: 'documentation', description: 'readme update' }),
        makeFeature({ id: 'F002', title: 'Critical security vulnerability', category: 'security', description: 'data loss prevention' }),
      ];
      const scored = await engine.scoreFeatures(features, context);
      expect(scored[0].id).toBe('F002');
      expect(scored[0].priorityScore).toBeGreaterThan(scored[1].priorityScore);
    });

    it('assigns priority levels', async () => {
      const features = [
        makeFeature({ id: 'F001', title: 'Critical security vulnerability fix', category: 'security', description: 'data loss' }),
      ];
      const scored = await engine.scoreFeatures(features, context);
      expect(['P0', 'P1', 'P2', 'P3']).toContain(scored[0].priority);
    });

    it('includes scoring details', async () => {
      const features = [makeFeature()];
      const scored = await engine.scoreFeatures(features, context);
      expect(scored[0].scoringDetails).toBeDefined();
      expect(scored[0].scoringDetails.impactFactors).toBeInstanceOf(Array);
      expect(scored[0].scoringDetails.effortFactors).toBeInstanceOf(Array);
      expect(scored[0].scoringDetails.strategicFactors).toBeInstanceOf(Array);
      expect(scored[0].scoringDetails.riskFactors).toBeInstanceOf(Array);
    });
  });

  describe('createScoringEngine', () => {
    it('returns a ScoringEngine instance', () => {
      const e = createScoringEngine();
      expect(e).toBeInstanceOf(ScoringEngine);
    });

    it('accepts custom weights', () => {
      const e = createScoringEngine({
        weights: { impact: 0.5, effort: 0.2, strategicValue: 0.2, risk: 0.1 },
      });
      expect(e).toBeInstanceOf(ScoringEngine);
    });
  });
});
