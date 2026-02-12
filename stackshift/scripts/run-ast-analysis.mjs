#!/usr/bin/env node

/**
 * CLI wrapper for AST-powered analysis tools
 * Run once upfront to generate analysis files, then all gears read from files
 *
 * Usage:
 *   ./scripts/run-ast-analysis.mjs analyze [directory]  # Run full analysis, save to files
 *   ./scripts/run-ast-analysis.mjs roadmap [directory]  # Generate roadmap from analysis
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateRoadmapToolHandler } from './ast-analysis/dist/tools/generate-roadmap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line args
const [,, command, directory = process.cwd(), ...flags] = process.argv;

// Parse flags
const options = {};
flags.forEach(flag => {
  const [key, value] = flag.replace('--', '').split('=');
  options[key] = value || true;
});

/**
 * Ensure analysis output directory exists
 */
async function ensureAnalysisDir(dir) {
  const analysisDir = path.join(dir, '.stackshift-analysis');
  await fs.mkdir(analysisDir, { recursive: true });
  return analysisDir;
}

/**
 * Run full AST analysis and save results to files
 * This should be run ONCE at the beginning (Gear 1 or 2)
 */
async function runFullAnalysis(dir) {
  console.log('🔬 Running comprehensive AST analysis...\n');

  const analysisDir = await ensureAnalysisDir(dir);

  // Run the roadmap tool (includes gap + feature analysis)
  const result = await generateRoadmapToolHandler({
    directory: dir,
    outputFormat: 'json',
    confidenceThreshold: 50,
    teamSize: 2,
  });

  // Extract JSON from MCP response
  let analysisData;
  if (result.content && Array.isArray(result.content)) {
    const jsonContent = result.content.find(item => item.type === 'text');
    if (jsonContent) {
      // The roadmap tool returns markdown by default, but we asked for JSON
      // So we need to parse the actual data structure
      analysisData = result;
    }
  }

  // Save raw analysis data
  const rawPath = path.join(analysisDir, 'raw-analysis.json');
  await fs.writeFile(rawPath, JSON.stringify(analysisData, null, 2));
  console.log(`✅ Saved raw analysis: ${rawPath}`);

  // Also generate markdown roadmap for human reading
  const roadmapResult = await generateRoadmapToolHandler({
    directory: dir,
    outputFormat: 'markdown',
    confidenceThreshold: 50,
    teamSize: 2,
  });

  const markdownContent = roadmapResult.content
    .filter(item => item.type === 'text')
    .map(item => item.text)
    .join('\n');

  const roadmapPath = path.join(analysisDir, 'roadmap.md');
  await fs.writeFile(roadmapPath, markdownContent);
  console.log(`✅ Saved roadmap: ${roadmapPath}`);

  // Create summary file with key metrics
  const summary = {
    analyzed_at: new Date().toISOString(),
    directory: dir,
    analysis_files: {
      raw: 'raw-analysis.json',
      roadmap: 'roadmap.md',
    },
    next_steps: [
      'Gear 3: Use analysis to detect implementation status',
      'Gear 4: Read roadmap.md for gap analysis',
      'Gear 6: Use analysis to verify implementations',
    ]
  };

  const summaryPath = path.join(analysisDir, 'summary.json');
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`✅ Saved summary: ${summaryPath}`);

  console.log('\n🎯 Analysis complete! Files saved to .stackshift-analysis/');
  console.log('   Other gears can now read these files instead of re-running AST.');

  return analysisDir;
}

/**
 * Check if analysis files exist and are recent
 */
async function checkAnalysisFiles(dir) {
  const analysisDir = path.join(dir, '.stackshift-analysis');
  const summaryPath = path.join(analysisDir, 'summary.json');

  try {
    const summaryContent = await fs.readFile(summaryPath, 'utf-8');
    const summary = JSON.parse(summaryContent);

    // Check if analysis is less than 1 hour old
    const analyzedAt = new Date(summary.analyzed_at);
    const now = new Date();
    const ageMinutes = (now - analyzedAt) / 1000 / 60;

    return {
      exists: true,
      path: analysisDir,
      age_minutes: ageMinutes,
      is_fresh: ageMinutes < 60,
      summary
    };
  } catch (error) {
    return {
      exists: false,
      path: analysisDir
    };
  }
}

async function main() {
  try {
    switch (command) {
      case 'analyze':
      case 'full-analysis': {
        // Run full AST analysis and save to files
        await runFullAnalysis(directory);
        process.exit(0);
        break;
      }

      case 'check': {
        // Check if analysis files exist
        const status = await checkAnalysisFiles(directory);
        console.log(JSON.stringify(status, null, 2));
        process.exit(status.exists ? 0 : 1);
        break;
      }

      case 'roadmap':
      case 'gap-analysis': {
        // Check if we have cached analysis
        const status = await checkAnalysisFiles(directory);

        if (status.exists && status.is_fresh) {
          console.log('📖 Using cached AST analysis from .stackshift-analysis/');
          const roadmapPath = path.join(status.path, 'roadmap.md');
          const roadmap = await fs.readFile(roadmapPath, 'utf-8');
          console.log(roadmap);
          process.exit(0);
        } else if (status.exists && !status.is_fresh) {
          console.log(`⚠️  Cached analysis is ${Math.round(status.age_minutes)} minutes old (stale)`);
          console.log('   Re-running analysis...\n');
        } else {
          console.log('📝 No cached analysis found. Running fresh analysis...\n');
        }

        // Run fresh analysis
        await runFullAnalysis(directory);

        // Now read and display the roadmap
        const roadmapPath = path.join(directory, '.stackshift-analysis', 'roadmap.md');
        const roadmap = await fs.readFile(roadmapPath, 'utf-8');
        console.log('\n' + roadmap);
        process.exit(0);
        break;
      }

      case 'status':
      case 'detect-status': {
        // Read analysis and extract implementation status
        const status = await checkAnalysisFiles(directory);

        if (!status.exists) {
          console.error('❌ No analysis files found. Run: analyze first');
          process.exit(1);
        }

        const rawPath = path.join(status.path, 'raw-analysis.json');
        const rawData = JSON.parse(await fs.readFile(rawPath, 'utf-8'));

        console.log('Implementation Status (from cached AST analysis):');
        console.log(JSON.stringify(rawData, null, 2));
        process.exit(0);
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        console.error('\nAvailable commands:');
        console.error('  analyze       - Run full AST analysis, save to .stackshift-analysis/');
        console.error('  check         - Check if analysis files exist');
        console.error('  roadmap       - Generate roadmap (uses cache if fresh)');
        console.error('  status        - Show implementation status from cache');
        console.error('\nOptions:');
        console.error('  --format=<markdown|json|csv|html>  Output format');
        console.error('  --threshold=<0-100>                Confidence threshold');
        console.error('  --teamSize=<number>                Team size for estimates');
        console.error('\nWorkflow:');
        console.error('  1. Run "analyze" once at the beginning (Gear 1-2)');
        console.error('  2. All other gears read from .stackshift-analysis/ files');
        console.error('  3. Re-run "analyze" if codebase changes significantly');
        console.error('\nExample:');
        console.error('  ./scripts/run-ast-analysis.mjs analyze .');
        console.error('  ./scripts/run-ast-analysis.mjs roadmap .  # uses cache');
        process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
