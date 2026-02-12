/**
 * Roadmap Exporter
 * Exports roadmaps to various formats (Markdown, JSON, CSV, GitHub Issues)
 * Implements User Story 5 (FR5): Export and Tracking
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import Handlebars from 'handlebars';
import { ExportError } from '../types/errors.js';
import type {
  Roadmap,
  ExportFormat,
  ExportOptions,
  ExportResult,
  RoadmapItem,
  Phase,
} from '../types/roadmap.js';

/**
 * GitHub Issue
 */
export interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  milestone?: string;
  assignee?: string;
}

/**
 * GitHub Export Options
 */
export interface GitHubExportOptions {
  repository?: string;
  milestoneName?: string;
  defaultAssignee?: string;
  labelPrefix?: string;
  dryRun?: boolean;
}

/**
 * Roadmap Exporter
 * Exports roadmaps to various formats
 */
export class RoadmapExporter {
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.registerHelpers();
  }

  /**
   * Export roadmap to specified format
   * @param roadmap - The roadmap to export
   * @param format - Export format
   * @param options - Export options
   * @returns Export result
   */
  async export(
    roadmap: Roadmap,
    format: ExportFormat,
    options?: ExportOptions
  ): Promise<ExportResult> {
    try {
      let content: string;
      let outputPath: string | undefined;

      switch (format) {
        case 'markdown': {
          content = await this.exportMarkdown(roadmap, options?.outputPath);
          outputPath = options?.outputPath || 'ROADMAP.md';
          break;
        }

        case 'json': {
          content = await this.exportJSON(roadmap);
          outputPath = options?.outputPath || 'roadmap.json';
          break;
        }

        case 'csv': {
          content = await this.exportCSV(roadmap);
          outputPath = options?.outputPath || 'roadmap.csv';
          break;
        }

        case 'github-issues': {
          // GitHub Issues export returns JSON representation
          const issues = await this.exportGitHubIssues(roadmap);
          content = JSON.stringify(issues, null, 2);
          outputPath = options?.outputPath || 'github-issues.json';
          break;
        }

        case 'html': {
          content = await this.exportHTML(roadmap);
          outputPath = options?.outputPath || 'roadmap.html';
          break;
        }

        default: {
          const unknownFormat: string = format;
          throw new ExportError(format, `Unsupported export format: ${unknownFormat}`);
        }
      }

      // Write to file if output path is specified
      if (outputPath) {
        await fs.writeFile(outputPath, content, 'utf-8');
      }

      return {
        success: true,
        format,
        content,
        outputPath,
        metadata: {
          generatedAt: new Date(),
          itemCount: 0,
          byteSize: content.length,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ExportError(format, message);
    }
  }

  /**
   * Export to Markdown (ROADMAP.md)
   * @param roadmap - The roadmap
   * @param templatePath - Optional custom template
   * @returns Markdown content
   */
  async exportMarkdown(roadmap: Roadmap, templatePath?: string): Promise<string> {
    const template = await this.loadTemplate(
      templatePath || path.join(__dirname, 'templates', 'roadmap.hbs')
    );

    return template(roadmap);
  }

  /**
   * Export to JSON
   * @param roadmap - The roadmap
   * @returns JSON string
   */
  async exportJSON(roadmap: Roadmap): Promise<string> {
    return JSON.stringify(roadmap, null, 2);
  }

  /**
   * Export to CSV
   * @param roadmap - The roadmap
   * @returns CSV content
   */
  async exportCSV(roadmap: Roadmap): Promise<string> {
    const rows: string[] = [];

    // Header
    rows.push('Priority,Phase,Title,Type,Effort (hours),Status,Tags,Dependencies');

    // Items
    for (const item of roadmap.allItems) {
      const row = [
        item.priority,
        item.phase.toString(),
        this.escapeCsv(item.title),
        item.type,
        item.effort.hours.toString(),
        item.status,
        this.escapeCsv(item.tags.join('; ')),
        this.escapeCsv(item.dependencies?.join('; ') || ''),
      ];

      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  /**
   * Generate GitHub issues
   * @param roadmap - The roadmap
   * @param options - GitHub options
   * @returns Array of GitHub issues
   */
  async exportGitHubIssues(
    roadmap: Roadmap,
    options?: GitHubExportOptions
  ): Promise<GitHubIssue[]> {
    const issues: GitHubIssue[] = [];
    const labelPrefix = options?.labelPrefix || '';

    for (const item of roadmap.allItems) {
      // Create issue body
      const body = this.generateIssueBody(item);

      // Generate labels
      const labels = [
        `${labelPrefix}${item.priority}`,
        `${labelPrefix}${item.type}`,
        ...item.tags.map(tag => `${labelPrefix}${tag}`),
      ];

      // Determine milestone
      const milestone = options?.milestoneName
        ? `${options.milestoneName} - Phase ${item.phase}`
        : undefined;

      issues.push({
        title: item.title,
        body,
        labels,
        milestone,
        assignee: item.assignee || options?.defaultAssignee,
      });
    }

    return issues;
  }

  /**
   * Export to HTML
   * @param roadmap - The roadmap
   * @returns HTML content
   */
  async exportHTML(roadmap: Roadmap): Promise<string> {
    // Generate HTML from markdown
    const markdown = await this.exportMarkdown(roadmap);

    // Basic HTML wrapper
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${roadmap.metadata.projectName} Roadmap</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    .priority-p0 { color: #d73a4a; font-weight: bold; }
    .priority-p1 { color: #e99695; }
    .priority-p2 { color: #f9d0c4; }
    .priority-p3 { color: #c5def5; }
  </style>
</head>
<body>
${this.markdownToHtmlSimple(markdown)}
</body>
</html>`;
  }

  /**
   * Load Handlebars template
   * @param templatePath - Path to template file
   * @returns Compiled template
   */
  private async loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    if (this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath)!;
    }

    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(templateContent);

    this.templateCache.set(templatePath, template);

    return template;
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers(): void {
    // Format date helper
    Handlebars.registerHelper('formatDate', (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });

    // If equals helper
    Handlebars.registerHelper('ifeq', function (this: any, a: any, b: any, options: any) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Math helpers
    Handlebars.registerHelper('add', (a: number, b: number) => a + b);
    Handlebars.registerHelper('multiply', (a: number, b: number) => a * b);

    // Percentage helper
    Handlebars.registerHelper('percentage', (value: number, total: number) => {
      if (total === 0) return '0';
      return ((value / total) * 100).toFixed(1);
    });
  }

  /**
   * Generate issue body from roadmap item
   * @param item - Roadmap item
   * @returns Issue body markdown
   */
  private generateIssueBody(item: RoadmapItem): string {
    const parts: string[] = [];

    // Description
    parts.push('## Description\n');
    parts.push(item.description);
    parts.push('');

    // Effort
    parts.push('## Effort Estimate\n');
    parts.push(`**Hours:** ${item.effort.hours}h`);
    parts.push(`**Range:** ${item.effort.range.optimistic}-${item.effort.range.pessimistic}h`);
    parts.push(`**Confidence:** ${item.effort.confidence}`);
    parts.push('');

    // Dependencies
    if (item.dependencies && item.dependencies.length > 0) {
      parts.push('## Dependencies\n');
      for (const dep of item.dependencies) {
        parts.push(`- Depends on: \`${dep}\``);
      }
      parts.push('');
    }

    // Source
    if (item.source) {
      parts.push('## Source\n');
      if (typeof item.source === 'string') {
        parts.push(`**Source:** ${item.source}`);
      } else {
        parts.push(`**Type:** ${(item.source as any).type || 'unknown'}`);
        if ('spec' in item.source && (item.source as any).spec) {
          parts.push(`**Spec:** ${(item.source as any).spec}`);
        }
        if ('requirement' in item.source && (item.source as any).requirement) {
          parts.push(`**Requirement:** ${(item.source as any).requirement}`);
        }
      }
      parts.push('');
    }

    // Metadata
    parts.push('---');
    parts.push(`**Priority:** ${item.priority} | **Phase:** ${item.phase} | **Type:** ${item.type}`);

    return parts.join('\n');
  }

  /**
   * Escape CSV value
   * @param value - Value to escape
   * @returns Escaped value
   */
  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Simple markdown to HTML conversion
   * @param markdown - Markdown content
   * @returns HTML content
   */
  private markdownToHtmlSimple(markdown: string): string {
    return markdown
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/^\|(.+)\|$/gm, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
      })
      .replace(/(<tr>.*<\/tr>)/gs, '<table>$1</table>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, (match) => {
        if (!match.match(/^<[a-z]/)) {
          return `<p>${match}</p>`;
        }
        return match;
      });
  }

  /**
   * Export roadmap to all formats
   * @param roadmap - The roadmap
   * @param outputDir - Output directory
   * @returns Map of format to export result
   */
  async exportAll(roadmap: Roadmap, outputDir: string): Promise<Map<ExportFormat, ExportResult>> {
    const results = new Map<ExportFormat, ExportResult>();

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Export to all formats
    const formats: ExportFormat[] = ['markdown', 'json', 'csv', 'html'];

    for (const format of formats) {
      const outputPath = path.join(outputDir, this.getDefaultFilename(format));
      const result = await this.export(roadmap, format, { format, outputPath });
      results.set(format, result);
    }

    return results;
  }

  /**
   * Get default filename for format
   * @param format - Export format
   * @returns Default filename
   */
  private getDefaultFilename(format: ExportFormat): string {
    switch (format) {
      case 'markdown':
        return 'ROADMAP.md';
      case 'json':
        return 'roadmap.json';
      case 'csv':
        return 'roadmap.csv';
      case 'github-issues':
        return 'github-issues.json';
      case 'html':
        return 'roadmap.html';
      default:
        return 'roadmap.txt';
    }
  }
}

/**
 * Create a RoadmapExporter instance
 */
export function createRoadmapExporter(): RoadmapExporter {
  return new RoadmapExporter();
}
