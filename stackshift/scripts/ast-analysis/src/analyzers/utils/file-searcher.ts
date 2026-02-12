/**
 * File Searcher Utility
 * Recursively finds TypeScript/JavaScript files in a directory
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { FileSearchError } from '../../types/errors.js';

export interface FileSearchOptions {
  /**
   * File extensions to include (e.g., ['.ts', '.js'])
   */
  extensions?: string[];

  /**
   * Directories to exclude (e.g., 'node_modules', '.git')
   */
  excludeDirs?: string[];

  /**
   * File patterns to exclude (e.g., '*.test.ts', '*.spec.ts')
   */
  excludePatterns?: string[];

  /**
   * Maximum depth to traverse (default: unlimited)
   */
  maxDepth?: number;

  /**
   * Include test files (default: false)
   */
  includeTests?: boolean;
}

const DEFAULT_OPTIONS: Required<FileSearchOptions> = {
  extensions: ['.ts', '.js', '.tsx', '.jsx'],
  excludeDirs: ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.cache'],
  excludePatterns: [],
  maxDepth: Infinity,
  includeTests: false,
};

export class FileSearcher {
  private options: Required<FileSearchOptions>;

  constructor(options: FileSearchOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Search for files in a directory
   * @param directory - Directory to search
   * @param pattern - Optional pattern to match (e.g., "config", "util")
   * @returns Array of file paths
   */
  async searchFiles(directory: string, pattern?: string): Promise<string[]> {
    try {
      const files = await this.searchRecursive(directory, 0);

      if (pattern) {
        const regex = new RegExp(pattern, 'i');
        return files.filter(file => {
          const basename = path.basename(file, path.extname(file));
          return regex.test(basename) || regex.test(file);
        });
      }

      return files;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new FileSearchError(pattern || '*', message);
    }
  }

  /**
   * Search for files matching a specific function or class name
   * @param directory - Directory to search
   * @param name - Function or class name to find
   * @returns Array of file paths that might contain the name
   */
  async searchByName(directory: string, name: string): Promise<string[]> {
    const files = await this.searchFiles(directory);
    const candidates: string[] = [];

    // Convert camelCase/PascalCase to multiple search patterns
    const patterns = this.generateSearchPatterns(name);

    for (const file of files) {
      const basename = path.basename(file, path.extname(file));
      const dirname = path.basename(path.dirname(file));

      // Check if filename or directory name matches
      if (patterns.some(p => basename.toLowerCase().includes(p) || dirname.toLowerCase().includes(p))) {
        candidates.push(file);
      }
    }

    return candidates;
  }

  /**
   * Find test files for a given source file
   * @param sourceFile - Source file path
   * @param directory - Root directory to search
   * @returns Array of test file paths
   */
  async findTestFiles(sourceFile: string, directory: string): Promise<string[]> {
    const basename = path.basename(sourceFile, path.extname(sourceFile));
    const testPatterns = [
      `${basename}.test`,
      `${basename}.spec`,
      `${basename}.test.integration`,
      `${basename}.integration.test`,
    ];

    const allFiles = await this.searchRecursive(directory, 0);
    const testFiles = allFiles.filter(file => {
      const fileBasename = path.basename(file, path.extname(file));
      return testPatterns.some(pattern => fileBasename.includes(pattern));
    });

    return testFiles;
  }

  /**
   * Check if a file exists
   * @param filePath - File path to check
   * @returns True if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  /**
   * Find files by glob-like pattern
   * @param directory - Directory to search
   * @param glob - Glob pattern (e.g., "**\/*.config.ts")
   * @returns Array of matching file paths
   */
  async findByGlob(directory: string, glob: string): Promise<string[]> {
    const files = await this.searchRecursive(directory, 0);
    const regex = this.globToRegex(glob);

    return files.filter(file => {
      const relativePath = path.relative(directory, file);
      return regex.test(relativePath);
    });
  }

  /**
   * Recursively search for files
   * @param directory - Directory to search
   * @param depth - Current depth
   * @returns Array of file paths
   */
  private async searchRecursive(directory: string, depth: number): Promise<string[]> {
    if (depth > this.options.maxDepth) {
      return [];
    }

    const files: string[] = [];

    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (this.options.excludeDirs.includes(entry.name)) {
            continue;
          }

          // Recursively search subdirectory
          const subFiles = await this.searchRecursive(fullPath, depth + 1);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          // Check if file matches criteria
          if (this.shouldIncludeFile(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory might not be readable, skip it
      console.warn(`Warning: Could not read directory ${directory}`);
    }

    return files;
  }

  /**
   * Check if a file should be included in results
   * @param filePath - File path to check
   * @returns True if file should be included
   */
  private shouldIncludeFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath);

    // Check extension
    if (!this.options.extensions.includes(ext)) {
      return false;
    }

    // Check if it's a test file
    const isTestFile = /\.(test|spec)\.(ts|js|tsx|jsx)$/.test(basename);
    if (isTestFile && !this.options.includeTests) {
      return false;
    }

    // Check exclude patterns
    for (const pattern of this.options.excludePatterns) {
      const regex = new RegExp(pattern);
      if (regex.test(basename)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate search patterns from a name
   * @param name - Name to generate patterns for
   * @returns Array of search patterns
   */
  private generateSearchPatterns(name: string): string[] {
    const patterns: string[] = [name.toLowerCase()];

    // Add kebab-case version
    const kebab = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    if (kebab !== name.toLowerCase()) {
      patterns.push(kebab);
    }

    // Add snake_case version
    const snake = name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    if (snake !== name.toLowerCase()) {
      patterns.push(snake);
    }

    return patterns;
  }

  /**
   * Convert a glob pattern to a RegExp
   * Includes ReDoS protection to prevent exponential backtracking
   *
   * @param glob - Glob pattern
   * @returns Regular expression
   * @throws Error if glob pattern is invalid or potentially dangerous
   */
  private globToRegex(glob: string): RegExp {
    // ReDoS Protection: Limit pattern length
    const MAX_GLOB_LENGTH = 500;
    if (glob.length > MAX_GLOB_LENGTH) {
      throw new Error(`Glob pattern too long: ${glob.length} chars (max ${MAX_GLOB_LENGTH})`);
    }

    // ReDoS Protection: Detect pathological patterns that could cause exponential backtracking
    // Examples: a*a*a*a*b, .*.*.*.*x, patterns with many overlapping wildcards
    const consecutiveWildcards = glob.match(/\*[^/*]*\*/g) || [];
    if (consecutiveWildcards.length > 3) {
      throw new Error(`Potentially dangerous glob pattern detected (ReDoS risk): too many wildcards`);
    }

    // Escape special regex characters except our glob wildcards (* and ?)
    let regex = glob
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
      .replace(/\*\*/g, '§DOUBLESTAR§') // Temporarily mark **
      .replace(/\*/g, '[^/]*?') // * matches anything except / (non-greedy)
      .replace(/§DOUBLESTAR§/g, '.*?') // ** matches anything including / (non-greedy)
      .replace(/\?/g, '.'); // ? matches single character

    return new RegExp(`^${regex}$`);
  }

  /**
   * Get file statistics
   * @param directory - Directory to analyze
   * @returns Statistics about files
   */
  async getStatistics(directory: string): Promise<{
    totalFiles: number;
    byExtension: Record<string, number>;
    totalLines: number;
  }> {
    const files = await this.searchRecursive(directory, 0);
    const byExtension: Record<string, number> = {};
    let totalLines = 0;

    for (const file of files) {
      const ext = path.extname(file);
      byExtension[ext] = (byExtension[ext] || 0) + 1;

      try {
        const content = await fs.readFile(file, 'utf-8');
        totalLines += content.split('\n').length;
      } catch {
        // Ignore read errors
      }
    }

    return {
      totalFiles: files.length,
      byExtension,
      totalLines,
    };
  }
}

/**
 * Utility function to create a FileSearcher instance
 */
export function createFileSearcher(options?: FileSearchOptions): FileSearcher {
  return new FileSearcher(options);
}

/**
 * Quick search utility for common use cases
 */
export async function findFiles(
  directory: string,
  options?: FileSearchOptions
): Promise<string[]> {
  const searcher = new FileSearcher(options);
  return searcher.searchFiles(directory);
}

/**
 * Find files by name pattern
 */
export async function findFilesByName(
  directory: string,
  name: string,
  options?: FileSearchOptions
): Promise<string[]> {
  const searcher = new FileSearcher(options);
  return searcher.searchByName(directory, name);
}
