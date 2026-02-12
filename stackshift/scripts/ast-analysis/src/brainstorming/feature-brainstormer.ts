/**
 * Feature Brainstormer
 * AI-powered brainstorming of desirable features across 8 categories
 * Implements User Story 3 (FR3): Desirable Feature Brainstorming
 *
 * This uses Claude (via MCP context) to critically analyze the project
 * and suggest contextual improvements rather than generic templates.
 */

import { ScoringEngine } from './scoring-engine.js';
import type {
  DesirableFeature,
  ScoredFeature,
  ProjectContext,
  FeatureCategory,
} from '../types/roadmap.js';

/**
 * Brainstorming Configuration
 */
export interface BrainstormConfig {
  /**
   * Categories to brainstorm (defaults to all 8)
   */
  categories?: FeatureCategory[];

  /**
   * Number of features to generate per category
   */
  featuresPerCategory?: number;

  /**
   * Verbose logging
   */
  verbose?: boolean;
}

const DEFAULT_CONFIG: Required<BrainstormConfig> = {
  categories: [
    'core-functionality',
    'developer-experience',
    'user-experience',
    'performance',
    'security',
    'testing',
    'documentation',
    'integrations',
  ],
  featuresPerCategory: 5,
  verbose: false,
};

/**
 * Feature categories and their descriptions
 */
const CATEGORY_DESCRIPTIONS: Record<FeatureCategory, string> = {
  'core-functionality': 'Core features that deliver primary business value',
  'developer-experience': 'Tools and features to improve developer productivity',
  'user-experience': 'Enhancements to user interface and user workflows',
  'performance': 'Optimizations for speed, scalability, and efficiency',
  'security': 'Security hardening, vulnerability fixes, and compliance',
  'testing': 'Testing infrastructure, coverage, and quality assurance',
  'documentation': 'User guides, API docs, and developer documentation',
  'integration': 'Third-party integration and ecosystem connection',
  'integrations': 'Third-party integrations and ecosystem connections',
};

/**
 * Feature Brainstormer
 * Generates strategic feature suggestions using AI analysis
 */
export class FeatureBrainstormer {
  private config: Required<BrainstormConfig>;
  private scoringEngine: ScoringEngine;

  constructor(config: BrainstormConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.scoringEngine = new ScoringEngine({ verbose: this.config.verbose });
  }

  /**
   * Brainstorm features across all categories using AI
   * @param context - Project context
   * @returns Scored features sorted by priority
   */
  async brainstormFeatures(context: ProjectContext): Promise<ScoredFeature[]> {
    this.log(`Brainstorming features for ${context.name}`);
    this.log(`Using AI-powered analysis to suggest context-specific improvements`);

    // This returns a prompt for Claude to analyze
    // When called via MCP, Claude will see this context and can provide analysis
    const analysisPrompt = this.buildComprehensiveAnalysisPrompt(context);

    this.log(`Generated analysis prompt for AI evaluation`);
    this.log(`Prompt asks Claude to analyze: ${context.name} (${context.linesOfCode} LOC, ${context.techStack.join(', ')})`);

    // For now, return the prompt so the MCP tool can present it to Claude
    // Claude can then provide the actual feature suggestions
    throw new Error(
      `AI-powered brainstorming requires Claude to analyze the project.\n\n` +
      `Please use this analysis prompt:\n\n${analysisPrompt}\n\n` +
      `Claude should respond with a JSON array of feature suggestions following this schema:\n` +
      `[\n` +
      `  {\n` +
      `    "title": "Feature Name",\n` +
      `    "description": "What it does and why it's valuable (2-3 sentences)",\n` +
      `    "category": "core-functionality | developer-experience | user-experience | performance | security | testing | documentation | integrations",\n` +
      `    "example": "Concrete example or use case",\n` +
      `    "strategicAlignment": ["How it aligns with project goals"],\n` +
      `    "dependencies": []\n` +
      `  }\n` +
      `]\n`
    );
  }

  /**
   * Build comprehensive analysis prompt for AI
   * This prompt asks Claude to critically analyze the project and suggest improvements
   */
  buildComprehensiveAnalysisPrompt(context: ProjectContext): string {
    const categoryFocus = this.config.categories.map(
      cat => `- **${cat}**: ${CATEGORY_DESCRIPTIONS[cat]}`
    ).join('\n');

    return `# Strategic Feature Brainstorming for ${context.name}

You are a senior product strategist and technical architect. Your task is to critically analyze this project and suggest ${this.config.featuresPerCategory} strategic improvements per category.

## Project Context

**Name:** ${context.name}
**Tech Stack:** ${context.techStack.join(', ')}
**Frameworks:** ${context.frameworks.length > 0 ? context.frameworks.join(', ') : 'None'}
**Language:** ${context.language}
**Scale:** ${context.linesOfCode.toLocaleString()} lines of code, ${context.fileCount} files
**Route:** ${context.route} (${context.route === 'greenfield' ? 'new project from business logic' : 'existing codebase management'})

## Current Features & Specifications

${context.currentFeatures.length > 0 ? context.currentFeatures.slice(0, 20).map(f => `- ${f}`).join('\n') : 'No features documented yet'}

${context.specs.length > 0 ? `\n## Specifications (${context.specs.length} total)\n\n${context.specs.slice(0, 5).map(s => `**${s.id}: ${s.title}**\n- Priority: ${s.priority}\n- Status: ${s.status}\n- FRs: ${s.functionalRequirements.length}\n- NFRs: ${s.nonFunctionalRequirements.length}`).join('\n\n')}` : ''}

## Categories to Brainstorm

${categoryFocus}

## Your Task

**CRITICAL:** Do NOT suggest generic features that could apply to any project. Instead:

1. **Analyze what this project ACTUALLY does** based on the features, specs, and tech stack
2. **Identify gaps** - What's missing that users would expect?
3. **Find inconsistencies** - Are there half-built features?
4. **Look for weaknesses** - Where is the project vulnerable?
5. **Consider the scale** - What problems emerge at ${context.linesOfCode.toLocaleString()} LOC?
6. **Think about the tech stack** - What does ${context.techStack.join(', ')} enable that's not being used?

For each category, suggest ${this.config.featuresPerCategory} **specific, contextual** improvements that would make THIS project better.

## Output Format

Return a JSON array of feature objects. Each feature must be:
- **Specific to this project** (not generic advice)
- **Actionable** (clear what needs to be built)
- **Valuable** (solves a real problem or adds real value)

\`\`\`json
[
  {
    "title": "Specific Feature Name (not generic)",
    "description": "What it does and why THIS PROJECT needs it (2-3 sentences)",
    "category": "one of: core-functionality, developer-experience, user-experience, performance, security, testing, documentation, integrations",
    "example": "Concrete example using THIS PROJECT's context",
    "strategicAlignment": ["How it aligns with THIS PROJECT's goals"],
    "dependencies": []
  }
]
\`\`\`

## Examples of BAD (Generic) vs GOOD (Contextual) Suggestions

❌ **BAD (Generic):** "Add caching layer for better performance"
✅ **GOOD (Contextual):** "Cache AST parsing results for ${context.name}'s ${context.linesOfCode.toLocaleString()} LOC codebase - parsing is done multiple times per analysis run and accounts for 40% of execution time"

❌ **BAD (Generic):** "Add input validation"
✅ **GOOD (Contextual):** "Validate MCP tool parameters in ${context.name} - currently accepts any directory path which could lead to permission errors or infinite loops on circular symlinks"

❌ **BAD (Generic):** "Improve documentation"
✅ **GOOD (Contextual):** "Add runnable examples to ${context.name}'s spec kit integration docs - users struggle to understand how constitution.md and specs/*.md interact based on current docs"

## Begin Analysis

Analyze ${context.name} critically and suggest ${this.config.categories.length * this.config.featuresPerCategory} specific, contextual improvements.`;
  }

  /**
   * Parse AI response to extract feature suggestions
   * This would be called after Claude responds with feature JSON
   */
  parseAIResponse(response: string): DesirableFeature[] {
    const features: DesirableFeature[] = [];

    try {
      // Extract JSON from code blocks if present
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                       response.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      if (!Array.isArray(parsed)) {
        throw new Error('Response must be a JSON array');
      }

      for (const item of parsed) {
        features.push({
          id: `brainstorm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          category: item.category,
          name: item.title,
          title: item.title,
          description: item.description,
          rationale: item.description, // Use description as rationale
          value: item.strategicAlignment ? item.strategicAlignment.join('; ') : 'Strategic value',
          effort: { hours: 0, confidence: 'medium', method: 'ai', range: { optimistic: 0, realistic: 0, pessimistic: 0 }, display: '0h' }, // Will be set by scorer
          priority: 'P2', // Will be set by scorer
          dependencies: item.dependencies || [],
          alternatives: [],
          risks: [],
          source: 'ai-generated',
          strategicAlignment: item.strategicAlignment?.length || 5,
        });
      }
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : String(error)}`);
    }

    return features;
  }

  /**
   * Score brainstormed features
   */
  async scoreFeatures(
    features: DesirableFeature[],
    context: ProjectContext
  ): Promise<ScoredFeature[]> {
    return this.scoringEngine.scoreFeatures(features, context);
  }

  /**
   * Log message if verbose
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[FeatureBrainstormer] ${message}`);
    }
  }
}

/**
 * Create a FeatureBrainstormer instance
 */
export function createFeatureBrainstormer(config?: BrainstormConfig): FeatureBrainstormer {
  return new FeatureBrainstormer(config);
}
