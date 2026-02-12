/**
 * Type Exports for F008 Roadmap Generation
 * External API for consumers of roadmap generation types
 */

// Core roadmap types
export type {
  Roadmap,
  RoadmapItem,
  RoadmapItemType,
  ItemStatus,
  Phase,
  Timeline,
  RoadmapMetadata,
  RoadmapSummary,
  Dependency,
  DependencyType,
  Risk,
} from './roadmap.js';

// Gap analysis types
export type {
  SpecGap,
  FeatureGap,
  GapStatus,
  FeatureGapStatus,
  FeatureGapRecommendation,
  Evidence,
  EvidenceType,
} from './roadmap.js';

// Feature brainstorming types
export type {
  DesirableFeature,
  ScoredFeature,
  FeatureCategory,
  BrainstormSource,
  ProjectContext,
  ParsedSpec,
  Requirement,
  AcceptanceCriterion,
  DocumentationFile,
  DocumentationClaim,
} from './roadmap.js';

// Effort and priority types
export type {
  EffortEstimate,
  EstimationMethod,
  Priority,
} from './roadmap.js';

// Export formats
export type {
  ExportFormat,
  ExportOptions,
  ExportResult,
} from './roadmap.js';

// Constants
export {
  CONFIDENCE_THRESHOLDS,
  EFFORT_MULTIPLIERS,
  HOURS_PER_WEEK,
  PRIORITY_DEFINITIONS,
} from './roadmap.js';

// Helper functions
export {
  createEvidence,
  combineEvidence,
  getEvidenceByType,
  hasEvidenceType,
  calculateTotalConfidenceImpact,
  createEffortEstimate,
  isImplemented,
  needsWork,
  getPriorityLevel,
  comparePriorities,
  sortByPriority,
} from './roadmap.js';

// Error types
export {
  RoadmapGenerationError,
  SpecParsingError,
  GapDetectionError,
  ExportError,
  FileSearchError,
  ASTParsingError,
} from './errors.js';
