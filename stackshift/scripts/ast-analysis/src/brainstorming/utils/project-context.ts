/**
 * Project Context Loader
 * Gathers comprehensive project information for AI-powered feature brainstorming
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { FileSearcher } from '../../analyzers/utils/file-searcher.js';
import { SpecParser } from '../../analyzers/utils/spec-parser.js';
import type { ProjectContext, ParsedSpec, DocumentationFile } from '../../types/roadmap.js';

/**
 * Load comprehensive project context for brainstorming
 * @param projectPath - Path to project root
 * @returns Project context
 */
export async function loadProjectContext(projectPath: string): Promise<ProjectContext> {
  const projectName = path.basename(projectPath);

  // Detect language and tech stack
  const { language, techStack, frameworks } = await detectTechStack(projectPath);

  // Load specifications
  const specs = await loadSpecifications(projectPath);

  // Load documentation
  const docs = await loadDocumentation(projectPath);

  // Extract current features from docs and code
  const currentFeatures = extractCurrentFeatures(docs, specs);

  // Calculate codebase stats
  const { linesOfCode, fileCount } = await calculateCodebaseStats(projectPath);

  // Determine route (greenfield vs brownfield)
  const route = await determineRoute(projectPath);

  return {
    path: projectPath,
    name: projectName,
    language,
    techStack,
    frameworks,
    currentFeatures,
    route,
    linesOfCode,
    fileCount,
    specs,
    docs,
  };
}

/**
 * Detect tech stack from project files
 */
async function detectTechStack(projectPath: string): Promise<{
  language: string;
  techStack: string[];
  frameworks: string[];
}> {
  const stack: string[] = [];
  const frameworks: string[] = [];
  let language = 'javascript';

  try {
    // Check package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

    // Detect language
    if (packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript) {
      language = 'typescript';
      stack.push('TypeScript');
    } else {
      stack.push('JavaScript');
    }

    // Detect runtime
    if (packageJson.dependencies) {
      const deps = Object.keys(packageJson.dependencies);

      if (deps.some(d => d.startsWith('@types/node') || d === 'node')) {
        stack.push('Node.js');
      }

      // Detect frameworks
      if (deps.includes('react') || deps.includes('next')) {
        frameworks.push('React');
        if (deps.includes('next')) frameworks.push('Next.js');
      }
      if (deps.includes('vue')) frameworks.push('Vue');
      if (deps.includes('angular')) frameworks.push('Angular');
      if (deps.includes('express')) frameworks.push('Express');
      if (deps.includes('fastify')) frameworks.push('Fastify');
      if (deps.includes('@modelcontextprotocol/sdk')) {
        frameworks.push('MCP');
        stack.push('Model Context Protocol');
      }
    }
  } catch {
    // No package.json, check for other indicators
  }

  // Check for Python
  try {
    await fs.access(path.join(projectPath, 'requirements.txt'));
    language = 'python';
    stack.push('Python');
  } catch {
    // Not Python
  }

  // Check for Go
  try {
    await fs.access(path.join(projectPath, 'go.mod'));
    language = 'go';
    stack.push('Go');
  } catch {
    // Not Go
  }

  return { language, techStack: stack, frameworks };
}

/**
 * Load specifications from project
 */
async function loadSpecifications(projectPath: string): Promise<ParsedSpec[]> {
  const specs: ParsedSpec[] = [];
  const parser = new SpecParser();

  // Try both specs/ and production-readiness-specs/
  const specsDirs = [
    path.join(projectPath, 'specs'),
    path.join(projectPath, 'production-readiness-specs'),
    path.join(projectPath, '.specify', 'memory', 'specifications'),
  ];

  for (const specsDir of specsDirs) {
    try {
      const dirSpecs = await parser.parseSpecsFromDirectory(specsDir);
      specs.push(...dirSpecs);
    } catch {
      // Directory doesn't exist
    }
  }

  return specs;
}

/**
 * Load documentation files
 */
async function loadDocumentation(projectPath: string): Promise<DocumentationFile[]> {
  const docs: DocumentationFile[] = [];

  const docFiles = [
    { name: 'README.md', type: 'readme' as const },
    { name: 'ROADMAP.md', type: 'roadmap' as const },
    { name: 'CHANGELOG.md', type: 'changelog' as const },
    { name: 'CONTRIBUTING.md', type: 'guide' as const },
  ];

  for (const { name, type } of docFiles) {
    try {
      const filePath = path.join(projectPath, name);
      const content = await fs.readFile(filePath, 'utf-8');

      docs.push({
        path: filePath,
        type,
        content,
        claims: [], // Will be populated by FeatureAnalyzer if needed
      });
    } catch {
      // File doesn't exist
    }
  }

  return docs;
}

/**
 * Extract current features from documentation and specs
 */
function extractCurrentFeatures(docs: DocumentationFile[], specs: ParsedSpec[]): string[] {
  const features = new Set<string>();

  // Extract from README
  const readme = docs.find(d => d.type === 'readme');
  if (readme) {
    // Look for features section
    const featuresMatch = readme.content.match(/##\s+Features[\s\S]*?(?=##|$)/i);
    if (featuresMatch) {
      const lines = featuresMatch[0].split('\n');
      for (const line of lines) {
        const bulletMatch = line.match(/^[-*]\s+(.+)$/);
        if (bulletMatch) {
          features.add(bulletMatch[1].trim());
        }
      }
    }
  }

  // Extract from specs
  for (const spec of specs) {
    features.add(spec.title);
    for (const req of spec.functionalRequirements) {
      features.add(req.title);
    }
  }

  return Array.from(features);
}

/**
 * Calculate codebase statistics
 */
async function calculateCodebaseStats(
  projectPath: string
): Promise<{ linesOfCode: number; fileCount: number }> {
  const searcher = new FileSearcher({
    extensions: ['.ts', '.js', '.tsx', '.jsx', '.py', '.go', '.java'],
    includeTests: false,
  });

  const files = await searcher.searchFiles(projectPath);
  let linesOfCode = 0;

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      linesOfCode += content.split('\n').length;
    } catch {
      // Skip unreadable files
    }
  }

  return { linesOfCode, fileCount: files.length };
}

/**
 * Determine if project is greenfield or brownfield
 */
async function determineRoute(projectPath: string): Promise<'greenfield' | 'brownfield'> {
  // Check for .stackshift-state.json
  try {
    const statePath = path.join(projectPath, '.stackshift-state.json');
    const state = JSON.parse(await fs.readFile(statePath, 'utf-8'));
    return state.route || 'brownfield';
  } catch {
    // No state file, default to brownfield
    return 'brownfield';
  }
}
