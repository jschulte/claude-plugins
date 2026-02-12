/**
 * Generate Roadmap MCP Tool
 * Analyzes gaps and generates strategic roadmap from specifications
 * Implements F008: Strategic Roadmap Generation from Gap Analysis
 */

import * as path from 'path';
import { SpecGapAnalyzer } from '../analyzers/gap-analyzer.js';
import { FeatureAnalyzer } from '../analyzers/feature-analyzer.js';
import { RoadmapGenerator } from '../roadmap/roadmap-generator.js';
import { RoadmapExporter } from '../exporters/roadmap-exporter.js';
import type { ExportFormat, ScoredFeature, ProjectContext } from '../types/roadmap.js';

/**
 * Generate Roadmap Arguments
 */
export interface GenerateRoadmapArgs {
  directory?: string;
  outputFormat?: ExportFormat | 'all';
  includeFeatureBrainstorming?: boolean;
  categories?: string[];
  confidenceThreshold?: number;
  teamSize?: number;
}

/**
 * Generate strategic roadmap from gap analysis
 */
export async function generateRoadmapToolHandler(args: GenerateRoadmapArgs) {
  const {
    directory = process.cwd(),
    outputFormat = 'markdown',
    includeFeatureBrainstorming = false, // Default to false since Phase 5 not implemented yet
    confidenceThreshold = 50,
    teamSize = 2,
  } = args;

  try {
    console.error(`[F008] Generating roadmap for ${directory}`);
    console.error(`[F008] Confidence threshold: ${confidenceThreshold}%`);
    console.error(`[F008] Team size: ${teamSize} developers`);

    const outputLines: string[] = [];
    outputLines.push('# 🗺️  StackShift Roadmap Generation\n');
    outputLines.push(`**Directory:** ${directory}`);
    outputLines.push(`**Output Format:** ${outputFormat}`);
    outputLines.push(`**Team Size:** ${teamSize} developer${teamSize !== 1 ? 's' : ''}\n`);

    // Step 1: Analyze spec gaps
    outputLines.push('## Step 1: Analyzing Specification Gaps\n');

    const specGapAnalyzer = new SpecGapAnalyzer({
      confidenceThreshold,
      verbose: true,
    });

    // Look for specs in either specs/ or production-readiness-specs/
    let specsDir = path.join(directory, 'specs');
    try {
      await import('fs/promises').then(fs => fs.access(specsDir));
    } catch {
      specsDir = path.join(directory, 'production-readiness-specs');
    }

    const specGaps = await specGapAnalyzer.analyzeSpecs(specsDir, directory);

    outputLines.push(`✅ Found ${specGaps.length} specification gaps\n`);

    // Show top gaps
    const topSpecGaps = specGaps
      .sort((a, b) => {
        // Sort by priority, then confidence
        const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.confidence - a.confidence;
      })
      .slice(0, 5);

    if (topSpecGaps.length > 0) {
      outputLines.push('**Top Gaps:**');
      for (const gap of topSpecGaps) {
        outputLines.push(
          `- [${gap.priority}] ${gap.description} (${gap.confidence}% confidence, ${gap.effort.hours}h)`
        );
      }
      outputLines.push('');
    }

    // Step 2: Analyze feature gaps
    outputLines.push('## Step 2: Analyzing Feature Completeness\n');

    const featureAnalyzer = new FeatureAnalyzer({
      accuracyThreshold: 70,
      deepVerification: true,
      verbose: true,
    });

    const featureGaps = await featureAnalyzer.analyzeFeatures(directory, directory);

    outputLines.push(`✅ Found ${featureGaps.length} feature gaps\n`);

    // Show top feature gaps
    const topFeatureGaps = featureGaps.slice(0, 5);

    if (topFeatureGaps.length > 0) {
      outputLines.push('**Top Feature Gaps:**');
      for (const gap of topFeatureGaps) {
        outputLines.push(
          `- ${gap.advertisedFeature} (${gap.accuracyScore}% accurate) - ${gap.reality}`
        );
      }
      outputLines.push('');
    }

    // Load project context (needed for both brainstorming and roadmap generation)
    const { loadProjectContext } = await import('../brainstorming/utils/project-context.js');
    const projectContext = await loadProjectContext(directory);

    // Step 3: Feature brainstorming (if enabled)
    let features: ScoredFeature[] = [];

    if (includeFeatureBrainstorming) {
      outputLines.push('## Step 3: AI-Powered Feature Brainstorming\n');

      // Create brainstormer
      const { FeatureBrainstormer } = await import('../brainstorming/feature-brainstormer.js');
      const brainstormer = new FeatureBrainstormer({
        featuresPerCategory: 5,
        verbose: true,
      });

      try {
        // This will throw an error with the analysis prompt
        features = await brainstormer.brainstormFeatures(projectContext);
      } catch (error) {
        // The error contains the analysis prompt for Claude
        if (error instanceof Error && error.message.includes('AI-powered brainstorming')) {
          outputLines.push('⚡ **AI Analysis Required**\n');
          outputLines.push('To complete feature brainstorming, Claude needs to analyze your project.\n');
          outputLines.push('---\n');
          outputLines.push(error.message);
          outputLines.push('\n---\n');
          outputLines.push('**After Claude provides the feature JSON, run the tool again to continue.**\n');

          // Return early with the analysis prompt
          return {
            content: [
              {
                type: 'text',
                text: outputLines.join('\n'),
              },
            ],
          };
        }
        throw error; // Re-throw if it's a different error
      }

      outputLines.push(`✅ Brainstormed ${features.length} desirable features\n`);

      // Show top features
      const topFeatures = features.slice(0, 5);
      if (topFeatures.length > 0) {
        outputLines.push('**Top Features:**');
        for (const feature of topFeatures) {
          outputLines.push(
            `- [${feature.priority}] ${feature.title} (Impact: ${feature.impact}/10, Effort: ${feature.effort.hours}h, ROI: ${feature.roi.toFixed(2)})`
          );
        }
        outputLines.push('');
      }
    }

    // Step 4: Generate roadmap
    outputLines.push('## Step 4: Generating Roadmap\n');

    const roadmapGenerator = new RoadmapGenerator({
      maxPhases: 4,
      teamSize,
      phaseStrategy: 'priority',
      includeRisks: true,
      includeDependencies: true,
      verbose: true,
    });

    const roadmap = await roadmapGenerator.generateRoadmap(
      [...specGaps, ...featureGaps],
      features,
      projectContext
    );

    outputLines.push(`✅ Generated roadmap with ${roadmap.allItems.length} items across ${roadmap.phases.length} phases\n`);

    // Show summary
    outputLines.push('**Summary:**');
    outputLines.push(`- P0 (Critical): ${roadmap.summary.byPriority?.p0Count || 0} items`);
    outputLines.push(`- P1 (High): ${roadmap.summary.byPriority?.p1Count || 0} items`);
    outputLines.push(`- P2 (Medium): ${roadmap.summary.byPriority?.p2Count || 0} items`);
    outputLines.push('');
    outputLines.push(`**Timeline Estimates:**`);
    outputLines.push(`- 1 developer: ${roadmap.timeline.byTeamSize.oneDev.weeks} weeks`);
    outputLines.push(`- 2 developers: ${roadmap.timeline.byTeamSize.twoDevs.weeks} weeks`);
    outputLines.push(`- 3 developers: ${roadmap.timeline.byTeamSize.threeDevs.weeks} weeks`);
    outputLines.push('');

    // Step 5: Export roadmap
    outputLines.push('## Step 5: Exporting Roadmap\n');

    const exporter = new RoadmapExporter();

    if (outputFormat === 'all') {
      const outputDir = path.join(directory, 'roadmap-exports');
      const results = await exporter.exportAll(roadmap, outputDir);

      outputLines.push(`✅ Exported roadmap to all formats in ${outputDir}\n`);

      for (const [format, result] of results) {
        outputLines.push(`- ${format}: ${result.outputPath}`);
      }
    } else {
      const outputPath = path.join(directory, exporter['getDefaultFilename'](outputFormat));
      const result = await exporter.export(roadmap, outputFormat, { format: outputFormat, outputPath });

      outputLines.push(`✅ Exported roadmap to ${result.outputPath}\n`);
    }

    outputLines.push('');
    outputLines.push('---\n');
    outputLines.push('## ✨ Roadmap Generation Complete!\n');
    outputLines.push('**Next Steps:**');
    for (const step of roadmap.summary.nextSteps) {
      outputLines.push(`- ${step}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: outputLines.join('\n'),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[F008] Error:`, error);

    return {
      content: [
        {
          type: 'text',
          text: `# ❌ Roadmap Generation Failed\n\n**Error:** ${errorMessage}\n\n**Stack trace:**\n\`\`\`\n${error instanceof Error ? error.stack : 'No stack trace'}\n\`\`\``,
        },
      ],
      isError: true,
    };
  }
}
