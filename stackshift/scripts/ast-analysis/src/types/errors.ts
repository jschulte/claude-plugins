/**
 * Error types for F008 Roadmap Generation
 */

/**
 * Base error for roadmap generation
 */
export class RoadmapGenerationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RoadmapGenerationError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Spec parsing errors
 */
export class SpecParsingError extends RoadmapGenerationError {
  constructor(specPath: string, details: string) {
    super(
      `Failed to parse spec at ${specPath}: ${details}`,
      'SPEC_PARSING_ERROR',
      { specPath, details }
    );
    this.name = 'SpecParsingError';
  }
}

/**
 * Gap detection errors
 */
export class GapDetectionError extends RoadmapGenerationError {
  constructor(requirement: string, details: string) {
    super(
      `Failed to detect gap for ${requirement}: ${details}`,
      'GAP_DETECTION_ERROR',
      { requirement, details }
    );
    this.name = 'GapDetectionError';
  }
}

/**
 * Export errors
 */
export class ExportError extends RoadmapGenerationError {
  constructor(format: string, details: string) {
    super(
      `Failed to export to ${format}: ${details}`,
      'EXPORT_ERROR',
      { format, details }
    );
    this.name = 'ExportError';
  }
}

/**
 * File search errors
 */
export class FileSearchError extends RoadmapGenerationError {
  constructor(pattern: string, details: string) {
    super(
      `Failed to search files with pattern ${pattern}: ${details}`,
      'FILE_SEARCH_ERROR',
      { pattern, details }
    );
    this.name = 'FileSearchError';
  }
}

/**
 * AST parsing errors
 */
export class ASTParsingError extends RoadmapGenerationError {
  constructor(filePath: string, details: string) {
    super(
      `Failed to parse AST for ${filePath}: ${details}`,
      'AST_PARSING_ERROR',
      { filePath, details }
    );
    this.name = 'ASTParsingError';
  }
}
