/**
 * Spec Parser Utility
 * Parses spec.md files to extract structured requirements data
 */

import MarkdownIt from 'markdown-it';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SpecParsingError } from '../../types/errors.js';
import type {
  ParsedSpec,
  Requirement,
  AcceptanceCriterion,
  SpecPhase,
  SpecTask,
  Priority,
} from '../../types/roadmap.js';

const md = new MarkdownIt();

export class SpecParser {
  /**
   * Parse a spec.md file and extract structured data
   * @param specPath - Path to spec.md file
   * @returns Parsed specification data
   */
  async parseSpec(specPath: string): Promise<ParsedSpec> {
    try {
      const content = await fs.readFile(specPath, 'utf-8');
      const tokens = md.parse(content, {});

      const spec: ParsedSpec = {
        id: this.extractId(content, specPath),
        title: this.extractTitle(tokens),
        path: specPath,
        status: this.extractMetadata(content, 'Status'),
        priority: this.extractPriority(content),
        effort: this.extractMetadata(content, 'Effort'),
        functionalRequirements: this.extractRequirements(content, 'FR'),
        nonFunctionalRequirements: this.extractRequirements(content, 'NFR'),
        acceptanceCriteria: this.extractAcceptanceCriteria(content),
        successCriteria: this.extractSuccessCriteria(content),
        phases: this.extractPhases(content),
      };

      return spec;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new SpecParsingError(specPath, message);
    }
  }

  /**
   * Extract spec ID from filename or content
   * @param content - File content
   * @param specPath - File path
   * @returns Spec ID (e.g., "F008")
   */
  private extractId(content: string, specPath: string): string {
    // Try to extract from title like "# F008: ..."
    const titleMatch = content.match(/^#\s+([A-Z]\d{3})[:\s]/m);
    if (titleMatch) {
      return titleMatch[1];
    }

    // Try to extract from filename like "F008-roadmap-generation/spec.md"
    const filenameMatch = specPath.match(/([A-Z]\d{3})-/);
    if (filenameMatch) {
      return filenameMatch[1];
    }

    // Fallback to filename
    return path.basename(path.dirname(specPath));
  }

  /**
   * Extract title from markdown tokens
   * @param tokens - Markdown tokens
   * @returns Title string
   */
  private extractTitle(tokens: any[]): string {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'heading_open' && token.tag === 'h1') {
        const inlineToken = tokens[i + 1];
        if (inlineToken && inlineToken.type === 'inline') {
          // Remove ID prefix if present (e.g., "F008: Title" -> "Title")
          return inlineToken.content.replace(/^[A-Z]\d{3}:\s*/, '');
        }
      }
    }
    return 'Unknown';
  }

  /**
   * Extract metadata field from content
   * @param content - File content
   * @param field - Field name (e.g., "Status", "Effort")
   * @returns Field value
   */
  private extractMetadata(content: string, field: string): string {
    const regex = new RegExp(`\\*\\*${field}:\\*\\*\\s*(.+?)(?:\\n|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract priority from content
   * @param content - File content
   * @returns Priority level
   */
  private extractPriority(content: string): Priority {
    const priorityText = this.extractMetadata(content, 'Priority');
    if (priorityText.includes('P0')) return 'P0';
    if (priorityText.includes('P1')) return 'P1';
    if (priorityText.includes('P2')) return 'P2';
    if (priorityText.includes('P3')) return 'P3';
    return 'P2'; // Default
  }

  /**
   * Extract functional or non-functional requirements
   * @param content - File content
   * @param prefix - "FR" or "NFR"
   * @returns Array of requirements
   */
  private extractRequirements(content: string, prefix: string): Requirement[] {
    const requirements: Requirement[] = [];

    // Match headings like "### FR1: Title" or "### NFR1: Title"
    const reqRegex = new RegExp(
      `###\\s+(${prefix}\\d+):?\\s+(.+?)(?:\\n|$)[\\s\\S]*?(?=###|$)`,
      'gi'
    );

    let match;
    while ((match = reqRegex.exec(content)) !== null) {
      const id = match[1];
      const title = match[2].trim();
      const sectionContent = match[0];

      // Extract priority from the section
      const priorityMatch = sectionContent.match(/\*\*Priority:\*\*\s*(P[0-3])/i);
      const priority: Priority = priorityMatch
        ? (priorityMatch[1] as Priority)
        : 'P2';

      // Extract description (content before "#### Acceptance Criteria")
      const descMatch = sectionContent.match(/\n\n([\s\S]*?)(?=####|###|$)/);
      const description = descMatch ? descMatch[1].trim() : '';

      // Extract acceptance criteria from this requirement section
      const acceptanceCriteria = this.extractAcceptanceCriteriaFromSection(sectionContent);

      requirements.push({
        id,
        title,
        priority,
        description,
        acceptanceCriteria,
      });
    }

    return requirements;
  }

  /**
   * Extract acceptance criteria from a requirement section
   * @param section - Requirement section content
   * @returns Array of acceptance criteria strings
   */
  private extractAcceptanceCriteriaFromSection(section: string): string[] {
    const criteria: string[] = [];

    // Look for items starting with status markers or dashes
    const lines = section.split('\n');
    let inAcceptanceCriteria = false;

    for (const line of lines) {
      if (line.includes('Acceptance Criteria') || line.includes('#### ')) {
        inAcceptanceCriteria = line.includes('Acceptance Criteria');
        continue;
      }

      if (inAcceptanceCriteria) {
        // Match lines like "- ✅ Description" or "**1.1 Title**"
        const statusMatch = line.match(/^[-*]\s*[✅⚠️❌]?\s*(.+)$/);
        const numberedMatch = line.match(/^\*\*\d+\.\d+\s+(.+?)\*\*/);

        if (statusMatch) {
          criteria.push(statusMatch[1].trim());
        } else if (numberedMatch) {
          criteria.push(numberedMatch[1].trim());
        }
      }
    }

    return criteria;
  }

  /**
   * Extract all acceptance criteria with status markers
   * @param content - File content
   * @returns Array of acceptance criteria with status
   */
  private extractAcceptanceCriteria(content: string): AcceptanceCriterion[] {
    const criteria: AcceptanceCriterion[] = [];

    // Match lines with status markers
    const lines = content.split('\n');
    let inAcceptanceSection = false;

    for (const line of lines) {
      // Check if we're in an acceptance criteria section
      if (line.includes('Acceptance Criteria')) {
        inAcceptanceSection = true;
        continue;
      }

      // Exit when we hit a new major section
      if (line.match(/^##[^#]/)) {
        inAcceptanceSection = false;
      }

      if (inAcceptanceSection) {
        // Match: "- ✅ Description" or "**1.1 Title**"
        const statusMatch = line.match(/^[-*]\s*([✅⚠️❌])\s*(.+)$/);
        const numberedMatch = line.match(/^\*\*\d+\.\d+\s+(.+?)\*\*\s*$/);

        if (statusMatch) {
          const status = statusMatch[1] as '✅' | '⚠️' | '❌';
          criteria.push({
            criterion: statusMatch[2].trim(),
            status,
          });
        } else if (numberedMatch) {
          criteria.push({
            criterion: numberedMatch[1].trim(),
            status: '',
          });
        }
      }
    }

    return criteria;
  }

  /**
   * Extract success criteria from Success Metrics section
   * @param content - File content
   * @returns Array of success criteria strings
   */
  private extractSuccessCriteria(content: string): string[] {
    const criteria: string[] = [];

    // Find Success Metrics section
    const metricsMatch = content.match(
      /###\s+Success Metrics[\s\S]*?(?=###|##[^#]|$)/i
    );

    if (!metricsMatch) {
      return criteria;
    }

    const section = metricsMatch[0];
    const lines = section.split('\n');

    for (const line of lines) {
      // Match bullet points like "- **Coverage:** Description"
      const match = line.match(/^[-*]\s*\*\*(.+?):\*\*\s*(.+)$/);
      if (match) {
        criteria.push(`${match[1]}: ${match[2]}`);
      }
    }

    return criteria;
  }

  /**
   * Extract implementation phases
   * @param content - File content
   * @returns Array of phases
   */
  private extractPhases(content: string): SpecPhase[] {
    const phases: SpecPhase[] = [];

    // Match phase headings like "### Phase 0: Title"
    const phaseRegex = /###\s+Phase\s+(\d+):\s+(.+?)(?:\s+\(([^)]+)\))?\n([\s\S]*?)(?=###\s+Phase|\n##[^#]|$)/gi;

    let match;
    while ((match = phaseRegex.exec(content)) !== null) {
      const number = parseInt(match[1], 10);
      const name = match[2].trim();
      const effort = match[3] ? match[3].trim() : '';
      const sectionContent = match[4];

      // Extract tasks from the phase content
      const tasks = this.extractTasks(sectionContent);

      // Determine status based on task completion
      const completedTasks = tasks.filter(t => t.completed).length;
      const totalTasks = tasks.length;
      let status = '';
      if (completedTasks === 0) {
        status = 'Not Started';
      } else if (completedTasks === totalTasks) {
        status = 'Complete';
      } else {
        status = 'In Progress';
      }

      phases.push({
        number,
        name,
        effort,
        status,
        tasks,
      });
    }

    return phases;
  }

  /**
   * Extract tasks from phase content
   * @param content - Phase content
   * @returns Array of tasks
   */
  private extractTasks(content: string): SpecTask[] {
    const tasks: SpecTask[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      // Match checkbox tasks: "- [ ] Description" or "- [x] Description"
      const checkboxMatch = line.match(/^[-*]\s+\[([ x])\]\s+(.+)$/i);
      if (checkboxMatch) {
        tasks.push({
          description: checkboxMatch[2].trim(),
          completed: checkboxMatch[1].toLowerCase() === 'x',
        });
        continue;
      }

      // Match numbered tasks: "1. Description"
      const numberedMatch = line.match(/^\d+\.\s+(.+)$/);
      if (numberedMatch) {
        tasks.push({
          description: numberedMatch[1].trim(),
          completed: false,
        });
      }
    }

    return tasks;
  }

  /**
   * Parse multiple spec files from a directory
   * @param specsDir - Directory containing spec files
   * @returns Array of parsed specs
   */
  async parseSpecsFromDirectory(specsDir: string): Promise<ParsedSpec[]> {
    const specs: ParsedSpec[] = [];

    try {
      const entries = await fs.readdir(specsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const specPath = path.join(specsDir, entry.name, 'spec.md');
          try {
            const stats = await fs.stat(specPath);
            if (stats.isFile()) {
              const spec = await this.parseSpec(specPath);
              specs.push(spec);
            }
          } catch {
            // Spec file doesn't exist in this directory, skip
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new SpecParsingError(specsDir, message);
    }

    return specs;
  }
}

/**
 * Utility function to create a SpecParser instance
 */
export function createSpecParser(): SpecParser {
  return new SpecParser();
}
