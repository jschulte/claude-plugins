/**
 * Unified Spec Parser
 * Facade that delegates to SpecParser or BmadSpecParser based on detection
 */

import { SpecParser } from './spec-parser.js';
import { BmadSpecParser } from './bmad-spec-parser.js';
import { SpecFormatDetector } from './spec-format-detector.js';
import type { ParsedSpec } from '../../types/roadmap.js';
import type { SpecFormat, SpecFormatDetectionResult } from '../../types/spec-format.js';
import { SpecParsingError } from '../../types/errors.js';
import { SPECKIT_PATHS } from '../../types/spec-format.js';
import * as path from 'path';

/**
 * Result from unified parsing
 */
export interface UnifiedParserResult {
  /** All parsed specs from all detected formats */
  specs: ParsedSpec[];
  /** Detected format type */
  format: SpecFormat;
  /** Full detection result */
  detection: SpecFormatDetectionResult;
  /** Source breakdown */
  sources: {
    specKit: ParsedSpec[];
    bmad: ParsedSpec[];
  };
}

/**
 * Options for unified parsing
 */
export interface UnifiedParserOptions {
  /** Project route (affects architecture parsing for BMAD) */
  route?: 'greenfield' | 'brownfield';
  /** Override detected format */
  forceFormat?: SpecFormat;
  /** Include architecture.md for BMAD (default: based on route) */
  includeArchitecture?: boolean;
}

/**
 * Unified Spec Parser
 * Automatically detects and parses both GitHub Spec Kit and BMAD specifications
 */
export class UnifiedSpecParser {
  private specKitParser: SpecParser;
  private bmadParser: BmadSpecParser;
  private detector: SpecFormatDetector;

  constructor() {
    this.specKitParser = new SpecParser();
    this.bmadParser = new BmadSpecParser();
    this.detector = new SpecFormatDetector();
  }

  /**
   * Parse specifications from a project directory
   * Auto-detects format and uses appropriate parser(s)
   *
   * @param projectDir - Root directory of the project
   * @param options - Parsing options
   * @returns Unified result with specs from all detected formats
   */
  async parseProject(
    projectDir: string,
    options: UnifiedParserOptions = {}
  ): Promise<UnifiedParserResult> {
    const detection = await this.detector.detect(projectDir);
    const format = options.forceFormat || detection.format;

    const sources: UnifiedParserResult['sources'] = {
      specKit: [],
      bmad: [],
    };

    try {
      // Determine if we should include architecture (Brownfield only)
      const includeArch =
        options.includeArchitecture ?? options.route === 'brownfield';

      switch (format) {
        case 'speckit':
          if (detection.specKitPath) {
            sources.specKit = await this.parseSpecKit(detection.specKitPath);
          }
          break;

        case 'bmad':
          if (detection.bmadPath) {
            sources.bmad = await this.bmadParser.parseSpecs(
              detection.bmadPath,
              includeArch
            );
          }
          break;

        case 'both':
          // Parse both formats
          if (detection.specKitPath) {
            sources.specKit = await this.parseSpecKit(detection.specKitPath);
          }
          if (detection.bmadPath) {
            sources.bmad = await this.bmadParser.parseSpecs(
              detection.bmadPath,
              includeArch
            );
          }
          break;

        case 'unknown':
          // No specs found - return empty result
          break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new SpecParsingError(projectDir, `Failed to parse specs: ${message}`);
    }

    // Combine all specs (no prefixing needed - ID schemes are distinct)
    const specs = [...sources.specKit, ...sources.bmad];

    return {
      specs,
      format,
      detection,
      sources,
    };
  }

  /**
   * Parse Spec Kit specs from directory
   */
  private async parseSpecKit(specKitRoot: string): Promise<ParsedSpec[]> {
    // Try specifications subdirectory first
    const specsDir = path.join(specKitRoot, 'memory', 'specifications');
    try {
      return await this.specKitParser.parseSpecsFromDirectory(specsDir);
    } catch {
      // Fall back to memory directory
      const memoryDir = path.join(specKitRoot, 'memory');
      return await this.specKitParser.parseSpecsFromDirectory(memoryDir);
    }
  }

  /**
   * Parse specs with explicit format override
   * Useful when user has specified framework in state
   *
   * @param projectDir - Root directory
   * @param format - Explicit format to use
   * @param options - Parsing options
   * @returns Parsed specs
   */
  async parseWithFormat(
    projectDir: string,
    format: SpecFormat,
    options: UnifiedParserOptions = {}
  ): Promise<ParsedSpec[]> {
    const result = await this.parseProject(projectDir, {
      ...options,
      forceFormat: format,
    });
    return result.specs;
  }

  /**
   * Get detected format without parsing
   */
  async detectFormat(projectDir: string): Promise<SpecFormatDetectionResult> {
    return this.detector.detect(projectDir);
  }

  /**
   * Parse only Spec Kit specs
   */
  async parseSpecKitOnly(projectDir: string): Promise<ParsedSpec[]> {
    const detection = await this.detector.detect(projectDir);
    if (!detection.specKitPath) {
      throw new SpecParsingError(
        projectDir,
        `Spec Kit format specified but ${SPECKIT_PATHS.root}/ not found`
      );
    }
    return this.parseSpecKit(detection.specKitPath);
  }

  /**
   * Parse only BMAD specs
   */
  async parseBmadOnly(
    projectDir: string,
    includeArchitecture = false
  ): Promise<ParsedSpec[]> {
    const detection = await this.detector.detect(projectDir);
    if (!detection.bmadPath) {
      throw new SpecParsingError(
        projectDir,
        'BMAD format specified but no BMAD directory found'
      );
    }
    return this.bmadParser.parseSpecs(detection.bmadPath, includeArchitecture);
  }

  /**
   * Get summary of specs by source
   */
  async getSpecSummary(projectDir: string): Promise<{
    format: SpecFormat;
    specKitCount: number;
    bmadCount: number;
    totalCount: number;
    details: string[];
  }> {
    const result = await this.parseProject(projectDir);

    return {
      format: result.format,
      specKitCount: result.sources.specKit.length,
      bmadCount: result.sources.bmad.length,
      totalCount: result.specs.length,
      details: result.detection.details,
    };
  }
}

/**
 * Create a UnifiedSpecParser instance
 */
export function createUnifiedSpecParser(): UnifiedSpecParser {
  return new UnifiedSpecParser();
}
