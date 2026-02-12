/**
 * Spec Format Detector
 * Auto-detects specification format: GitHub Spec Kit, BMAD, or both
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import yaml from 'js-yaml';
import type {
  SpecFormat,
  SpecFormatDetectionResult,
  BmadConfig,
} from '../../types/spec-format.js';
import {
  BMAD_OUTPUT_LOCATIONS,
  BMAD_CONFIG_PATHS,
  BMAD_SPEC_FILES,
  SPECKIT_PATHS,
} from '../../types/spec-format.js';

/**
 * Spec Format Detector
 * Detects whether a project uses GitHub Spec Kit, BMAD, or both
 */
export class SpecFormatDetector {
  /**
   * Detect specification format in a project directory
   * @param projectDir - Root directory of the project
   * @returns Detection result with paths and confidence
   */
  async detect(projectDir: string): Promise<SpecFormatDetectionResult> {
    const details: string[] = [];
    let specKitPath: string | undefined;
    let bmadPath: string | undefined;
    let bmadConfigPath: string | undefined;

    // Check for Spec Kit (.specify/)
    const specifyPath = path.join(projectDir, SPECKIT_PATHS.root);
    if (await this.directoryExists(specifyPath)) {
      // Verify it has specs
      const hasSpecs = await this.hasSpecKitSpecs(specifyPath);
      if (hasSpecs) {
        specKitPath = specifyPath;
        details.push(`Found Spec Kit at ${SPECKIT_PATHS.root}/`);
      } else {
        details.push(`Found ${SPECKIT_PATHS.root}/ but no specs inside`);
      }
    }

    // Check for BMAD config (custom output path)
    for (const configPath of BMAD_CONFIG_PATHS) {
      const fullConfigPath = path.join(projectDir, configPath);
      if (await this.fileExists(fullConfigPath)) {
        bmadConfigPath = fullConfigPath;
        details.push(`Found BMAD config at ${configPath}`);

        // Try to read custom output path from config
        const customPath = await this.readBmadOutputPath(fullConfigPath);
        if (customPath) {
          const resolvedPath = this.resolveBmadPath(projectDir, customPath);
          if (await this.hasBmadFiles(resolvedPath)) {
            bmadPath = resolvedPath;
            details.push(`Found BMAD specs at custom path: ${customPath}`);
          }
        }
        break;
      }
    }

    // If no custom path found, check default BMAD locations
    if (!bmadPath) {
      for (const loc of BMAD_OUTPUT_LOCATIONS) {
        const fullPath = path.join(projectDir, loc);
        if (await this.hasBmadFiles(fullPath)) {
          bmadPath = fullPath;
          details.push(`Found BMAD specs at ${loc}/`);
          break;
        }
      }
    }

    // Determine format and confidence
    const result = this.determineFormat(specKitPath, bmadPath, details);

    return {
      ...result,
      specKitPath,
      bmadPath,
      bmadConfigPath,
    };
  }

  /**
   * Check if a directory has Spec Kit specs
   */
  private async hasSpecKitSpecs(specifyDir: string): Promise<boolean> {
    try {
      // Check for memory/specifications directory
      const specsDir = path.join(specifyDir, 'memory', 'specifications');
      if (await this.directoryExists(specsDir)) {
        const entries = await fs.readdir(specsDir);
        return entries.length > 0;
      }

      // Check for memory directory with spec files
      const memoryDir = path.join(specifyDir, 'memory');
      if (await this.directoryExists(memoryDir)) {
        const entries = await fs.readdir(memoryDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const specFile = path.join(memoryDir, entry.name, 'spec.md');
            if (await this.fileExists(specFile)) {
              return true;
            }
          }
        }
      }

      // Check for constitution.md at minimum
      const constitutionPath = path.join(specifyDir, 'memory', 'constitution.md');
      return this.fileExists(constitutionPath);
    } catch {
      return false;
    }
  }

  /**
   * Check if directory has BMAD-format files
   */
  private async hasBmadFiles(dirPath: string): Promise<boolean> {
    try {
      if (!(await this.directoryExists(dirPath))) {
        return false;
      }

      const files = await fs.readdir(dirPath);
      const bmadFiles = [
        BMAD_SPEC_FILES.prd,
        BMAD_SPEC_FILES.architecture,
        BMAD_SPEC_FILES.epics,
      ];

      // Must have at least one key BMAD file
      return bmadFiles.some(f => files.includes(f));
    } catch {
      return false;
    }
  }

  /**
   * Read custom output path from BMAD config.yaml
   */
  private async readBmadOutputPath(configPath: string): Promise<string | undefined> {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const config = yaml.load(content) as BmadConfig;

      // Try planning_artifacts first, then output_folder
      return config?.planning_artifacts || config?.output_folder;
    } catch {
      return undefined;
    }
  }

  /**
   * Resolve BMAD path (handles relative paths and placeholders)
   */
  private resolveBmadPath(projectDir: string, bmadPath: string): string {
    // Replace {project-root} placeholder
    const resolved = bmadPath.replace(/\{project-root\}/g, projectDir);

    // Handle relative paths
    if (resolved.startsWith('./') || resolved.startsWith('../')) {
      return path.resolve(projectDir, resolved);
    }

    // Handle absolute paths
    if (path.isAbsolute(resolved)) {
      return resolved;
    }

    // Default: treat as relative to project
    return path.join(projectDir, resolved);
  }

  /**
   * Determine format and confidence based on findings
   */
  private determineFormat(
    specKitPath: string | undefined,
    bmadPath: string | undefined,
    details: string[]
  ): Pick<SpecFormatDetectionResult, 'format' | 'confidence' | 'details'> {
    let format: SpecFormat = 'unknown';
    let confidence = 0;

    if (specKitPath && bmadPath) {
      format = 'both';
      confidence = 95;
      details.push('Both Spec Kit and BMAD formats detected');
    } else if (specKitPath) {
      format = 'speckit';
      confidence = 90;
      details.push('Using GitHub Spec Kit format');
    } else if (bmadPath) {
      format = 'bmad';
      confidence = 85;
      details.push('Using BMAD format');
    } else {
      details.push('No specification format detected');
    }

    return { format, confidence, details };
  }

  /**
   * Get BMAD files found in a directory
   */
  async getBmadFiles(bmadDir: string): Promise<string[]> {
    try {
      if (!(await this.directoryExists(bmadDir))) {
        return [];
      }

      const files = await fs.readdir(bmadDir);
      const bmadFileNames = Object.values(BMAD_SPEC_FILES);

      return files.filter(f => bmadFileNames.includes(f as any));
    } catch {
      return [];
    }
  }

  /**
   * Check if sprint artifacts directory exists
   */
  async hasSprintArtifacts(bmadDir: string): Promise<boolean> {
    const sprintDir = path.join(bmadDir, '..', 'implementation-artifacts', 'sprint-artifacts');
    return this.directoryExists(sprintDir);
  }

  /**
   * Get sprint artifacts directory path
   */
  getSprintArtifactsPath(bmadDir: string): string {
    return path.join(bmadDir, '..', 'implementation-artifacts', 'sprint-artifacts');
  }

  private async directoryExists(p: string): Promise<boolean> {
    try {
      const stat = await fs.stat(p);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }

  private async fileExists(p: string): Promise<boolean> {
    try {
      const stat = await fs.stat(p);
      return stat.isFile();
    } catch {
      return false;
    }
  }
}

/**
 * Create a SpecFormatDetector instance
 */
export function createSpecFormatDetector(): SpecFormatDetector {
  return new SpecFormatDetector();
}
