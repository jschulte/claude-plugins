/**
 * Spec Format Types
 * Type definitions for multi-framework specification support (GitHub Spec Kit + BMAD)
 */

import type { Priority } from './roadmap.js';

// ============================================================================
// Spec Format Detection Types
// ============================================================================

/**
 * Supported specification formats
 */
export type SpecFormat = 'speckit' | 'bmad' | 'both' | 'unknown';

/**
 * Result of spec format detection
 */
export interface SpecFormatDetectionResult {
  /** Detected format type */
  format: SpecFormat;
  /** Path to Spec Kit specs (e.g., ".specify/") */
  specKitPath?: string;
  /** Path to BMAD specs (e.g., "_bmad-output/planning-artifacts/") */
  bmadPath?: string;
  /** Path to BMAD config file if found */
  bmadConfigPath?: string;
  /** Detection confidence (0-100) */
  confidence: number;
  /** Details about what was found */
  details: string[];
}

// ============================================================================
// BMAD-Specific Types
// ============================================================================

/**
 * BMAD file frontmatter structure
 * Used in prd.md, architecture.md, epics.md, etc.
 */
export interface BmadFrontmatter {
  /** Completed workflow steps */
  stepsCompleted?: number[];
  /** Paths to input documents loaded */
  inputDocuments?: string[];
  /** Type of workflow that generated this doc */
  workflowType?: 'prd' | 'architecture' | 'ux-design' | 'epics' | 'tech-spec' | 'story';
  /** Last completed step number */
  lastStep?: number;
  /** Project name */
  project_name?: string;
  /** Author/user name */
  user_name?: string;
  /** Creation date */
  date?: string;
  /** Epic ID (for story files) */
  epic_id?: number;
  /** Story ID (for story files) */
  story_id?: number;
  /** Story status */
  status?: string;
}

/**
 * BMAD Epic parsed from epics.md
 */
export interface BmadEpic {
  /** Epic ID (e.g., "E1") */
  id: string;
  /** Epic title */
  title: string;
  /** Epic description */
  description: string;
  /** Stories within this epic */
  stories: BmadStory[];
  /** Priority level */
  priority: Priority;
}

/**
 * BMAD Story parsed from epics.md or sprint artifacts
 */
export interface BmadStory {
  /** Story ID (e.g., "S1.1") */
  id: string;
  /** Story title */
  title: string;
  /** Story description (As a... I want... So that...) */
  description: string;
  /** Acceptance criteria (Given/When/Then) */
  acceptanceCriteria: string[];
  /** Tasks within this story */
  tasks: string[];
  /** Priority level */
  priority: Priority;
}

/**
 * BMAD API Contract from architecture.md
 */
export interface BmadApiContract {
  /** Endpoint path */
  path: string;
  /** HTTP method */
  method: string;
  /** Endpoint description */
  description: string;
  /** Request schema or parameters */
  request?: string;
  /** Response schema */
  response?: string;
}

/**
 * BMAD Data Model from architecture.md
 */
export interface BmadDataModel {
  /** Entity name */
  name: string;
  /** Entity description */
  description: string;
  /** Fields/attributes */
  fields: string[];
  /** Relationships to other models */
  relationships?: string[];
}

/**
 * BMAD Architectural Decision Record
 */
export interface BmadAdr {
  /** Decision ID */
  id: string;
  /** Decision title */
  title: string;
  /** Context/background */
  context: string;
  /** The decision made */
  decision: string;
  /** Rationale for the decision */
  rationale?: string;
  /** Consequences/implications */
  consequences?: string[];
}

/**
 * Parsed BMAD architecture document
 */
export interface BmadArchitecture {
  /** API contracts */
  apiContracts: BmadApiContract[];
  /** Data models */
  dataModels: BmadDataModel[];
  /** Architectural decisions */
  adrs: BmadAdr[];
}

// ============================================================================
// BMAD Config Types
// ============================================================================

/**
 * BMAD config.yaml structure (subset of relevant fields)
 */
export interface BmadConfig {
  /** Project name */
  project_name?: string;
  /** User name */
  user_name?: string;
  /** Output folder for generated docs */
  output_folder?: string;
  /** Planning artifacts location */
  planning_artifacts?: string;
  /** Implementation artifacts location */
  implementation_artifacts?: string;
  /** Product knowledge location (existing docs) */
  product_knowledge?: string;
}

// ============================================================================
// Unified Parser Result Types
// ============================================================================

/**
 * Source of a parsed specification
 */
export type SpecSource = 'speckit' | 'bmad-prd' | 'bmad-epic' | 'bmad-story' | 'bmad-architecture';

/**
 * Extended ParsedSpec with source tracking
 */
export interface SourcedParsedSpec {
  /** Original spec format source */
  source: SpecSource;
  /** Original file path */
  sourcePath: string;
}

// ============================================================================
// BMAD Location Constants
// ============================================================================

/**
 * Default BMAD output locations (priority order)
 */
export const BMAD_OUTPUT_LOCATIONS = [
  '_bmad-output/planning-artifacts',
  '_bmad-output',
  'docs',
] as const;

/**
 * BMAD config file paths to check
 */
export const BMAD_CONFIG_PATHS = [
  '_bmad/bmm/config.yaml',
  '_bmad/core/config.yaml',
] as const;

/**
 * Key BMAD spec files
 */
export const BMAD_SPEC_FILES = {
  prd: 'prd.md',
  architecture: 'architecture.md',
  epics: 'epics.md',
  uxDesign: 'ux-design-specification.md',
  techSpec: 'tech-spec.md',
  projectContext: 'project-context.md',
} as const;

/**
 * Spec Kit standard paths
 */
export const SPECKIT_PATHS = {
  root: '.specify',
  memory: '.specify/memory',
  specifications: '.specify/memory/specifications',
  constitution: '.specify/memory/constitution.md',
} as const;
