/**
 * File Utilities
 *
 * Safe file system operations using native Node.js APIs
 * Replaces dangerous shell commands to prevent command injection
 */

import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Recursively find files matching a pattern
 * Safe alternative to `find` command
 *
 * @param directory Directory to search
 * @param patterns File patterns to match (e.g., ['.test.', '.spec.'])
 * @param maxDepth Maximum directory depth (default: 10)
 * @param maxFiles Maximum files to process (default: 10000)
 * @returns Array of matching file paths
 */
export async function findFiles(
  directory: string,
  patterns: string[],
  maxDepth: number = 10,
  maxFiles: number = 10000
): Promise<string[]> {
  const results: string[] = [];
  let filesProcessed = 0;

  async function search(dir: string, depth: number): Promise<void> {
    // Respect max depth limit
    if (depth > maxDepth) {
      return;
    }

    // Respect max files limit (prevent DoS)
    if (filesProcessed >= maxFiles) {
      return;
    }

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        // Stop if we've hit the file limit
        if (filesProcessed >= maxFiles) {
          break;
        }

        const fullPath = path.join(dir, entry.name);

        // Skip node_modules and hidden directories (except .specify)
        if (entry.isDirectory()) {
          if (
            entry.name === 'node_modules' ||
            (entry.name.startsWith('.') && entry.name !== '.specify')
          ) {
            continue;
          }
          await search(fullPath, depth + 1);
        } else if (entry.isFile()) {
          filesProcessed++;

          // Check if filename matches any pattern
          for (const pattern of patterns) {
            if (entry.name.includes(pattern)) {
              results.push(fullPath);
              break;
            }
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read (permission errors, etc.)
      return;
    }
  }

  await search(directory, 0);
  return results;
}

/**
 * Count files matching patterns
 * Safe alternative to `find | wc -l`
 *
 * @param directory Directory to search
 * @param patterns File patterns to match
 * @returns Number of matching files
 */
export async function countFiles(directory: string, patterns: string[]): Promise<number> {
  const files = await findFiles(directory, patterns);
  return files.length;
}

/**
 * Check if a file exists
 *
 * @param filePath Path to check
 * @returns true if file exists and is accessible
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read file with size limit
 * Prevents DoS from reading huge files
 *
 * @param filePath File to read
 * @param maxSize Maximum file size in bytes (default: 10MB)
 * @returns File contents
 */
export async function readFileSafe(
  filePath: string,
  maxSize: number = 10 * 1024 * 1024
): Promise<string> {
  const stats = await fs.stat(filePath);

  if (stats.size > maxSize) {
    throw new Error(`File too large: ${stats.size} bytes (max ${maxSize})`);
  }

  return fs.readFile(filePath, 'utf-8');
}

/**
 * Parse JSON file safely
 * Validates size and removes dangerous properties
 *
 * @param filePath Path to JSON file
 * @returns Parsed JSON object
 */
export async function readJsonSafe(filePath: string): Promise<any> {
  const content = await readFileSafe(filePath);

  const parsed = JSON.parse(content);

  // Remove dangerous properties
  delete parsed.__proto__;
  delete parsed.constructor;
  delete parsed.prototype;

  return parsed;
}
