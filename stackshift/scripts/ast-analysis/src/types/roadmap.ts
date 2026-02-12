/**
 * Core types for F008 Roadmap Generation
 * Automated strategic planning from gap analysis
 */

// ============================================================================
// Gap Analysis Types
// ============================================================================

export type GapStatus = 'complete' | 'partial' | 'stub' | 'missing';

export type EvidenceType =
  | 'file-not-found'
  | 'function-not-found'
  | 'exact-function-match'
  | 'ast-signature-verified'
  | 'test-file-exists'
  | 'test-file-missing'
  | 'returns-todo-comment'
  | 'returns-guidance-text'
  | 'name-similarity-only'
  | 'comments-suggest-incomplete';

export interface Evidence {
  type: EvidenceType;
  description: string;
  location?: string;
  line?: number;
  snippet?: string;
  confidenceImpact: number; // -50 to +50
}

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';

export type EstimationMethod =
  | 'historical'
  | 'ai'
  | 'complexity'
  | 'analogy'
  | 'expert'
  | 'placeholder';

export interface EffortEstimate {
  hours: number;
  confidence: 'low' | 'medium' | 'high';
  method: EstimationMethod;
  range: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  display: string;
}

export interface SpecGap {
  id: string;
  spec: string;
  requirement: string;
  description: string;
  status: GapStatus;
  confidence: number; // 0-100
  evidence: Evidence[];
  expectedLocations: string[];
  actualLocations: string[];
  effort: EffortEstimate;
  priority: Priority;
  impact: string;
  recommendation: string;
  dependencies: string[];
}

// ============================================================================
// Feature Gap Analysis Types
// ============================================================================

export type FeatureGapStatus = 'accurate' | 'misleading' | 'false';

export type FeatureGapRecommendation =
  | 'implement-feature'
  | 'update-documentation'
  | 'add-disclaimer'
  | 'remove-claim';

export interface DocumentationClaim {
  claim: string;
  location: { line: number; section: string };
  relatedFeatures: string[];
}

export interface FeatureGap {
  id: string;
  advertisedFeature: string;
  claim: string;
  source: string;
  reality: string;
  accuracyScore: number; // 0-100
  status: FeatureGapStatus;
  recommendation: FeatureGapRecommendation;
  evidence: Evidence[];
}

export interface CompletenessAssessment {
  overall: number; // 0-100
  categories: {
    coreFeatures: number;
    documentation: number;
    testing: number;
    security: number;
    deployment: number;
    errorHandling: number;
    performance: number;
  };
  priorities: {
    p0: { total: number; complete: number; percentage: number };
    p1: { total: number; complete: number; percentage: number };
    p2: { total: number; complete: number; percentage: number };
    p3: { total: number; complete: number; percentage: number };
  };
  productionReadiness: number; // 0-100
  criticalGaps: SpecGap[];
  recommendations: string[];
}

// ============================================================================
// Feature Brainstorming Types
// ============================================================================

export type FeatureCategory =
  | 'core-functionality'
  | 'user-experience'
  | 'integration'
  | 'integrations'
  | 'performance'
  | 'security'
  | 'developer-experience'
  | 'documentation'
  | 'testing';

export type BrainstormSource =
  | 'ai-generated'
  | 'gap-analysis'
  | 'competitive-analysis'
  | 'best-practices'
  | 'user-request'
  | 'manual';

export interface Risk {
  id: string;
  title: string;
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  severity: 'low' | 'medium' | 'high';
  mitigations: string[];
  contingency?: string;
  affectedItems: string[];
}

export interface DesirableFeature {
  id: string;
  category: FeatureCategory;
  name: string;
  title: string;
  description: string;
  rationale: string;
  value: string;
  effort: EffortEstimate;
  priority: Priority;
  dependencies: string[];
  alternatives: string[];
  risks: Risk[];
  source: BrainstormSource;
  strategicAlignment: number;
}

export interface ScoredFeature extends DesirableFeature {
  impact: number;
  impactScore: number; // 1-10
  effortScore: number; // 1-10
  roi: number; // impact / effort
  strategicValue: number; // 0-10
  riskScore: number; // 0-10
  priorityScore: number;
  scoringDetails: {
    impactFactors: string[];
    effortFactors: string[];
    strategicFactors: string[];
    riskFactors: string[];
  };
}

// ============================================================================
// Roadmap Types
// ============================================================================

export type RoadmapItemType =
  | 'spec-gap'
  | 'feature-gap'
  | 'gap-fix'
  | 'feature'
  | 'enhancement'
  | 'technical-debt'
  | 'documentation'
  | 'testing';

export type ItemStatus = 'not-started' | 'in-progress' | 'blocked' | 'completed' | 'wont-do';

export interface RoadmapItem {
  id: string;
  type: RoadmapItemType;
  title: string;
  description: string;
  priority: Priority;
  effort: EffortEstimate;
  phase: number;
  status: ItemStatus;
  owner?: string;
  assignee?: string;
  source?: string;
  dependencies: string[];
  blocks: string[];
  successCriteria: string[];
  acceptanceCriteria: string[];
  relatedTo?: string;
  tags: string[];
}

export interface Phase {
  number: number;
  name: string;
  goal: string;
  duration: string;
  startWeek: number;
  endWeek: number;
  items: RoadmapItem[];
  totalEffort: EffortEstimate;
  outcome: string;
  successCriteria: string[];
  deliverables: string[];
  dependencies: number[];
}

export type DependencyType = 'sequential' | 'prerequisite' | 'related' | 'optional';

export interface Dependency {
  dependent: string;
  dependsOn: string;
  type: DependencyType;
  reason: string;
  isHard: boolean;
}

export interface Timeline {
  totalHours: number;
  totalWeeks: number;
  byTeamSize: {
    oneDev: {
      weeks: number;
      completionDate: Date;
      assumptions: string[];
    };
    twoDevs: {
      weeks: number;
      completionDate: Date;
      assumptions: string[];
    };
    threeDevs: {
      weeks: number;
      completionDate: Date;
      assumptions: string[];
    };
  };
  criticalPath: {
    items: RoadmapItem[];
    durationWeeks: number;
  };
  parallelizableWork: {
    items: RoadmapItem[];
    durationWeeks: number;
  };
}

export interface RoadmapMetadata {
  generated: Date;
  projectName: string;
  projectPath: string;
  toolVersion: string;
  analysisBasis: {
    specsAnalyzed: number;
    gapsFound: number;
    featuresIdentified: number;
    totalItems: number;
  };
}

export interface RoadmapSummary {
  overview: string;
  currentState: string;
  targetState: string;
  completion: CompletenessAssessment;
  highlights: string[];
  nextSteps: string[];
  byPriority?: {
    p0Count: number;
    p1Count: number;
    p2Count: number;
  };
}

export interface Roadmap {
  metadata: RoadmapMetadata;
  summary: RoadmapSummary;
  phases: Phase[];
  allItems: RoadmapItem[];
  priorities: {
    p0: { count: number; effort: EffortEstimate; items: RoadmapItem[] };
    p1: { count: number; effort: EffortEstimate; items: RoadmapItem[] };
    p2: { count: number; effort: EffortEstimate; items: RoadmapItem[] };
    p3: { count: number; effort: EffortEstimate; items: RoadmapItem[] };
  };
  timeline: Timeline;
  risks: Risk[];
  dependencies: Dependency[];
  successCriteria: string[];
  recommendations: string[];
}

// ============================================================================
// Analysis Context Types
// ============================================================================

export interface ProjectContext {
  path: string;
  name: string;
  language: string;
  techStack: string[];
  frameworks: string[];
  currentFeatures: string[];
  route: 'greenfield' | 'brownfield';
  linesOfCode: number;
  fileCount: number;
  specs: ParsedSpec[];
  docs: DocumentationFile[];
}

export interface ParsedSpec {
  id: string;
  title: string;
  path: string;
  status: string;
  priority: Priority;
  effort: string;
  functionalRequirements: Requirement[];
  nonFunctionalRequirements: Requirement[];
  acceptanceCriteria: AcceptanceCriterion[];
  successCriteria: string[];
  phases: SpecPhase[];
}

export interface Requirement {
  id: string;
  title: string;
  priority: Priority;
  description: string;
  acceptanceCriteria: string[];
  implementation?: ImplementationDetails;
}

export interface ImplementationDetails {
  files: string[];
  functions: string[];
  status: GapStatus;
}

export interface AcceptanceCriterion {
  criterion: string;
  status: '✅' | '⚠️' | '❌' | '';
  implementedIn?: string;
}

export interface SpecPhase {
  number: number;
  name: string;
  effort: string;
  status: string;
  tasks: SpecTask[];
}

export interface SpecTask {
  description: string;
  completed: boolean;
}

export interface DocumentationFile {
  path: string;
  type: 'readme' | 'roadmap' | 'guide' | 'spec' | 'changelog' | 'other';
  content: string;
  claims: DocumentationClaim[];
}

// ============================================================================
// Export Types
// ============================================================================

export type ExportFormat = 'markdown' | 'json' | 'csv' | 'github-issues' | 'html';

export interface ExportOptions {
  format: ExportFormat;
  outputPath?: string;
  includeConfidenceScores?: boolean;
  includeEvidence?: boolean;
  groupBy?: 'priority' | 'phase' | 'type';
  filterPriority?: Priority[];
}

export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  content: string;
  outputPath?: string;
  metadata: {
    generatedAt: Date;
    itemCount: number;
    byteSize: number;
  };
}

export interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  milestone?: string;
  assignees: string[];
  priority: Priority;
  relatedItems: string[];
}

// ============================================================================
// Progress Tracking Types
// ============================================================================

export interface ProgressBreakdown {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  percentage: number;
}

export interface BurndownPoint {
  date: Date;
  itemsRemaining: number;
  idealRemaining: number;
}

export interface RoadmapProgress {
  generatedAt: Date;
  lastUpdated: Date;
  totalItems: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  blocked: number;
  wontDo: number;
  percentComplete: number;
  velocity: number;
  estimatedCompletion: Date;
  itemStatus: Map<string, ItemStatus>;
  byPriority: {
    p0: ProgressBreakdown;
    p1: ProgressBreakdown;
    p2: ProgressBreakdown;
    p3: ProgressBreakdown;
  };
  byPhase: Map<number, ProgressBreakdown>;
  burndown: BurndownPoint[];
}

export interface ItemChange {
  field: string;
  oldValue: any;
  newValue: any;
  reason?: string;
}

export interface RoadmapDelta {
  previousDate: Date;
  currentDate: Date;
  added: RoadmapItem[];
  removed: RoadmapItem[];
  changed: {
    item: RoadmapItem;
    changes: ItemChange[];
  }[];
  completed: RoadmapItem[];
  regressions: SpecGap[];
  summary: {
    addedCount: number;
    removedCount: number;
    changedCount: number;
    completedCount: number;
    regressionCount: number;
  };
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface RoadmapConfig {
  features: {
    astParsing: boolean;
    aiBrainstorming: boolean;
    multiLanguageSupport: boolean;
    githubIntegration: boolean;
  };
  gapDetection: {
    confidenceThreshold: number;
    includeStubs: boolean;
    includePartial: boolean;
    languageSupport: string[];
  };
  brainstorming: {
    enabled: boolean;
    categories: FeatureCategory[];
    maxFeaturesPerCategory: number;
    aiModel?: string;
  };
  roadmap: {
    maxPhases: number;
    phaseStrategy: 'priority' | 'timeline' | 'dependency';
    includeRisks: boolean;
    includeDependencies: boolean;
  };
  export: {
    defaultFormat: ExportFormat;
    outputDirectory: string;
    createGitHubIssues: boolean;
    templatePath?: string;
  };
  performance: {
    maxAnalysisTime: number;
    parallelism: number;
    cacheEnabled: boolean;
  };
}

// ============================================================================
// Constants
// ============================================================================

export const CONFIDENCE_THRESHOLDS = {
  VERY_HIGH: 90,
  HIGH: 70,
  MEDIUM: 50,
  LOW: 30,
  VERY_LOW: 0,
} as const;

export const EFFORT_MULTIPLIERS = {
  ONE_DEV: 1.0,
  TWO_DEVS: 0.55,
  THREE_DEVS: 0.4,
} as const;

export const HOURS_PER_WEEK = 35;

export const GAP_STATUS_PRIORITY: Record<GapStatus, number> = {
  missing: 1,
  stub: 2,
  partial: 3,
  complete: 4,
} as const;

export const PRIORITY_DEFINITIONS: Record<
  Priority,
  {
    level: Priority;
    label: string;
    description: string;
    criteria: string[];
  }
> = {
  P0: {
    level: 'P0',
    label: 'Critical',
    description: 'Blockers, security issues, misleading docs',
    criteria: [
      'Blocks production deployment',
      'Security vulnerability',
      'Data loss risk',
      'Misleading documentation',
    ],
  },
  P1: {
    level: 'P1',
    label: 'High',
    description: 'Core value proposition, major gaps',
    criteria: [
      'Core feature incomplete',
      'Major advertised feature missing',
      'Poor user experience',
    ],
  },
  P2: {
    level: 'P2',
    label: 'Medium',
    description: 'Enhancements, additional languages',
    criteria: ['Nice-to-have feature', 'Additional language support', 'Performance improvement'],
  },
  P3: {
    level: 'P3',
    label: 'Nice to Have',
    description: 'Polish, integrations, advanced features',
    criteria: ['Optional integration', 'UI polish', 'Advanced feature'],
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create evidence object
 */
export function createEvidence(
  type: EvidenceType,
  description: string,
  confidenceImpact: number,
  location?: string,
  line?: number,
  snippet?: string
): Evidence {
  return {
    type,
    description,
    location,
    line,
    snippet,
    confidenceImpact,
  };
}

/**
 * Combine multiple pieces of evidence
 */
export function combineEvidence(...evidence: Evidence[]): Evidence[] {
  return evidence.filter(e => e !== null && e !== undefined);
}

/**
 * Get evidence by type
 */
export function getEvidenceByType(evidence: Evidence[], type: EvidenceType): Evidence[] {
  return evidence.filter(e => e.type === type);
}

/**
 * Check if evidence contains a specific type
 */
export function hasEvidenceType(evidence: Evidence[], type: EvidenceType): boolean {
  return evidence.some(e => e.type === type);
}

/**
 * Calculate total confidence impact from evidence
 */
export function calculateTotalConfidenceImpact(evidence: Evidence[]): number {
  return evidence.reduce((sum, e) => sum + e.confidenceImpact, 0);
}

/**
 * Create effort estimate
 */
export function createEffortEstimate(
  hours: number,
  confidence: 'low' | 'medium' | 'high',
  method: EstimationMethod
): EffortEstimate {
  const optimistic = Math.round(hours * 0.7);
  const realistic = hours;
  const pessimistic = Math.round(hours * 1.5);

  return {
    hours,
    confidence,
    method,
    range: {
      optimistic,
      realistic,
      pessimistic,
    },
    display: `${hours}h (${optimistic}-${pessimistic}h)`,
  };
}

/**
 * Check if a gap status is implemented
 */
export function isImplemented(status: GapStatus): boolean {
  return status === 'complete';
}

/**
 * Check if a gap status needs work
 */
export function needsWork(status: GapStatus): boolean {
  return status !== 'complete';
}

/**
 * Get priority level number
 */
export function getPriorityLevel(priority: Priority): number {
  const levels: Record<Priority, number> = {
    P0: 0,
    P1: 1,
    P2: 2,
    P3: 3,
  };
  return levels[priority];
}

/**
 * Compare priorities
 */
export function comparePriorities(a: Priority, b: Priority): number {
  return getPriorityLevel(a) - getPriorityLevel(b);
}

/**
 * Sort items by priority
 */
export function sortByPriority<T extends { priority: Priority }>(items: T[]): T[] {
  return [...items].sort((a, b) => comparePriorities(a.priority, b.priority));
}
