/**
 * Feature Analyzer
 * Analyzes advertised features against actual capabilities
 * Implements User Story 2 (FR2): Feature Completeness Analysis
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import MarkdownIt from 'markdown-it';
import { FileSearcher } from './utils/file-searcher.js';
import { ASTParser } from './utils/ast-parser.js';
import { ConfidenceScorer } from './utils/confidence-scorer.js';
import { GapDetectionError } from '../types/errors.js';
import { readFileSafe } from '../utils/file-utils.js';
import { createLogger } from '../utils/logger.js';
import type {
  FeatureGap,
  DocumentationClaim,
  DocumentationFile,
  Evidence,
  FeatureGapStatus,
  FeatureGapRecommendation,
} from '../types/roadmap.js';
import { createEvidence } from '../types/roadmap.js';

const logger = createLogger('feature-analyzer');

const md = new MarkdownIt();

/**
 * Feature Analyzer Configuration
 */
export interface FeatureAnalyzerConfig {
  /**
   * Minimum accuracy score to flag a feature gap (0-100)
   */
  accuracyThreshold?: number;

  /**
   * Check implementation details
   */
  deepVerification?: boolean;

  /**
   * Verbose logging
   */
  verbose?: boolean;
}

const DEFAULT_CONFIG: Required<FeatureAnalyzerConfig> = {
  accuracyThreshold: 70,
  deepVerification: true,
  verbose: false,
};

/**
 * Feature Analyzer
 * Analyzes documentation claims against actual implementation
 */
export class FeatureAnalyzer {
  private config: Required<FeatureAnalyzerConfig>;
  private fileSearcher: FileSearcher;
  private astParser: ASTParser;
  private confidenceScorer: ConfidenceScorer;

  constructor(config: FeatureAnalyzerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.fileSearcher = new FileSearcher();
    this.astParser = new ASTParser();
    this.confidenceScorer = new ConfidenceScorer();
  }

  /**
   * Analyze documentation files for feature claims
   * @param docsDir - Path to documentation directory
   * @param codeDir - Path to codebase root
   * @returns Array of feature gaps found
   */
  async analyzeFeatures(docsDir: string, codeDir: string): Promise<FeatureGap[]> {
    this.log(`Analyzing features in ${docsDir} against code in ${codeDir}`);

    try {
      const docFiles = await this.findDocFiles(docsDir);
      this.log(`Found ${docFiles.length} documentation files`);

      const allGaps: FeatureGap[] = [];

      for (const docFile of docFiles) {
        this.log(`Analyzing doc: ${docFile.path}`);
        const gaps = await this.analyzeDocFile(docFile, codeDir);
        allGaps.push(...gaps);
      }

      // Filter by accuracy threshold
      const filteredGaps = allGaps.filter(
        gap => gap.accuracyScore < this.config.accuracyThreshold
      );

      this.log(
        `Found ${filteredGaps.length} feature gaps (${allGaps.length} total claims analyzed)`
      );

      return filteredGaps;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new GapDetectionError('analyzeFeatures', message);
    }
  }

  /**
   * Verify a specific claim
   * @param claim - The claim to verify
   * @param codeDir - Path to codebase root
   * @returns Feature gap details or null if accurate
   */
  async verifyClaim(claim: DocumentationClaim, codeDir: string): Promise<FeatureGap | null> {
    this.log(`Verifying claim: ${claim.claim}`);

    const evidence: Evidence[] = [];
    let accuracyScore = 50; // Start neutral

    // Search for related implementation
    const keywords = this.extractKeywords(claim.claim);

    for (const keyword of keywords.slice(0, 3)) {
      const files = await this.fileSearcher.searchByName(codeDir, keyword);

      if (files.length > 0) {
        accuracyScore += 10;
        evidence.push(
          createEvidence(
            'name-similarity-only',
            `Found ${files.length} files matching "${keyword}"`,
            10
          )
        );

        // Deep verification if configured
        if (this.config.deepVerification && files.length < 5) {
          for (const file of files.slice(0, 2)) {
            const implEvidence = await this.verifyImplementation(file, claim);
            evidence.push(...implEvidence);
            accuracyScore += implEvidence.filter(e => e.confidenceImpact > 0).length * 5;
          }
        }
      }
    }

    // Check for related features
    for (const feature of claim.relatedFeatures) {
      const featureFiles = await this.fileSearcher.searchByName(codeDir, feature);
      if (featureFiles.length > 0) {
        accuracyScore += 5;
        evidence.push(
          createEvidence(
            'name-similarity-only',
            `Related feature "${feature}" found`,
            5
          )
        );
      }
    }

    // Determine status
    const status = this.determineStatus(accuracyScore, evidence);

    // Only return gap if accuracy is below threshold
    if (accuracyScore >= this.config.accuracyThreshold && status === 'accurate') {
      return null;
    }

    // Determine what the reality is
    const reality = this.determineReality(evidence, accuracyScore);

    // Generate recommendation
    const recommendation = this.generateRecommendation(status, accuracyScore);

    const gap: FeatureGap = {
      id: uuidv4(),
      advertisedFeature: claim.claim,
      claim: claim.claim,
      source: `Line ${claim.location.line}, ${claim.location.section}`,
      reality,
      accuracyScore,
      status,
      recommendation,
      evidence,
    };

    this.log(
      `⚠️  Feature gap: "${claim.claim}" - Accuracy: ${accuracyScore}%, Status: ${status}`
    );

    return gap;
  }

  /**
   * Calculate accuracy score for documentation
   * @param docsDir - Path to documentation
   * @param codeDir - Path to codebase
   * @returns Overall accuracy score (0-100)
   */
  async calculateAccuracy(docsDir: string, codeDir: string): Promise<number> {
    const docFiles = await this.findDocFiles(docsDir);
    let totalClaims = 0;
    let accurateClaimsScore = 0;

    for (const docFile of docFiles) {
      const claims = this.parseDocumentation(docFile.content);

      for (const claim of claims) {
        totalClaims++;
        const gap = await this.verifyClaim(claim, codeDir);

        if (!gap || gap.status === 'accurate') {
          accurateClaimsScore += 100;
        } else {
          accurateClaimsScore += gap.accuracyScore;
        }
      }
    }

    if (totalClaims === 0) {
      return 100; // No claims = nothing to be inaccurate about
    }

    return Math.round(accurateClaimsScore / totalClaims);
  }

  /**
   * Parse documentation to extract feature claims
   * @param content - Documentation content
   * @returns Array of documentation claims
   */
  parseDocumentation(content: string): DocumentationClaim[] {
    const claims: DocumentationClaim[] = [];
    const lines = content.split('\n');

    let currentSection = 'Unknown';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track current section
      if (line.match(/^#+\s+/)) {
        currentSection = line.replace(/^#+\s+/, '').trim();
      }

      // Look for feature claims (bullet points with specific patterns)
      const bulletMatch = line.match(/^[-*]\s+(.+)$/);
      if (bulletMatch) {
        const claim = bulletMatch[1].trim();

        // Filter out non-feature claims
        if (this.isFeatureClaim(claim)) {
          const relatedFeatures = this.extractRelatedFeatures(claim);

          claims.push({
            claim,
            location: { line: i + 1, section: currentSection },
            relatedFeatures,
          });
        }
      }

      // Look for bold statements that might be claims
      const boldMatch = line.match(/\*\*(.+?)\*\*/g);
      if (boldMatch) {
        for (const match of boldMatch) {
          const claim = match.replace(/\*\*/g, '').trim();

          if (this.isFeatureClaim(claim) && claim.length > 20) {
            const relatedFeatures = this.extractRelatedFeatures(claim);

            claims.push({
              claim,
              location: { line: i + 1, section: currentSection },
              relatedFeatures,
            });
          }
        }
      }
    }

    return claims;
  }

  /**
   * Find documentation files
   * @param docsDir - Documentation directory
   * @returns Array of documentation files
   */
  async findDocFiles(docsDir: string): Promise<DocumentationFile[]> {
    const docFiles: DocumentationFile[] = [];

    try {
      // Look for common documentation files
      const patterns = [
        'README.md',
        'ROADMAP.md',
        'FEATURES.md',
        'CHANGELOG.md',
        'docs/**/*.md',
      ];

      const files: string[] = [];

      // Check root directory files
      for (const pattern of ['README.md', 'ROADMAP.md', 'FEATURES.md', 'CHANGELOG.md']) {
        const filePath = path.join(docsDir, pattern);
        const exists = await this.fileSearcher.fileExists(filePath);
        if (exists) {
          files.push(filePath);
        }
      }

      // Check docs directory
      const docsSubDir = path.join(docsDir, 'docs');
      try {
        const docsFiles = await this.findMarkdownFiles(docsSubDir);
        files.push(...docsFiles);
      } catch {
        // docs/ doesn't exist
      }

      // Parse each file (with size limit to prevent DoS)
      const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5MB max per doc file
      for (const filePath of files) {
        try {
          const content = await readFileSafe(filePath, MAX_DOC_SIZE);
          const type = this.classifyDocType(path.basename(filePath));
          const claims = this.parseDocumentation(content);

          docFiles.push({
            path: filePath,
            type,
            content,
            claims,
          });
        } catch (error) {
          // Log but continue with other files
          logger.warn(`Could not read documentation file`, {
            file: filePath,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } catch (error) {
      logger.warn(`Could not read documentation directory`, {
        directory: docsDir,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return docFiles;
  }

  /**
   * Find markdown files recursively
   * @param dir - Directory to search
   * @returns Array of file paths
   */
  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.findMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory not readable
    }

    return files;
  }

  /**
   * Classify documentation type
   * @param filename - Filename
   * @returns Documentation type
   */
  private classifyDocType(
    filename: string
  ): 'readme' | 'roadmap' | 'guide' | 'spec' | 'changelog' | 'other' {
    const lower = filename.toLowerCase();

    if (lower.includes('readme')) return 'readme';
    if (lower.includes('roadmap')) return 'roadmap';
    if (lower.includes('guide')) return 'guide';
    if (lower.includes('spec')) return 'spec';
    if (lower.includes('changelog')) return 'changelog';

    return 'other';
  }

  /**
   * Analyze a documentation file for feature gaps
   * @param docFile - Documentation file
   * @param codeDir - Code directory
   * @returns Array of feature gaps
   */
  private async analyzeDocFile(
    docFile: DocumentationFile,
    codeDir: string
  ): Promise<FeatureGap[]> {
    const gaps: FeatureGap[] = [];

    for (const claim of docFile.claims) {
      const gap = await this.verifyClaim(claim, codeDir);
      if (gap) {
        gaps.push(gap);
      }
    }

    return gaps;
  }

  /**
   * Verify implementation for a claim
   * @param filePath - File to check
   * @param claim - Claim to verify
   * @returns Evidence from verification
   */
  private async verifyImplementation(
    filePath: string,
    claim: DocumentationClaim
  ): Promise<Evidence[]> {
    const evidence: Evidence[] = [];

    try {
      const parsed = await this.astParser.parseFile(filePath);

      // Check for related functions
      const keywords = this.extractKeywords(claim.claim);
      for (const keyword of keywords) {
        const matchingFuncs = parsed.functions.filter(f =>
          f.name.toLowerCase().includes(keyword.toLowerCase())
        );

        if (matchingFuncs.length > 0) {
          evidence.push(
            createEvidence(
              'exact-function-match',
              `Found function matching "${keyword}"`,
              20,
              filePath
            )
          );

          // Check if it's a stub
          for (const func of matchingFuncs) {
            if (func.isStub) {
              evidence.push(
                createEvidence(
                  'returns-guidance-text',
                  `Function ${func.name} is a stub`,
                  -30,
                  filePath
                )
              );
            }
          }
        }
      }

      // Check exports
      if (parsed.exports.length > 0) {
        evidence.push(
          createEvidence(
            'exact-function-match',
            `File exports ${parsed.exports.length} items`,
            10,
            filePath
          )
        );
      }
    } catch (error) {
      // Could not parse file
      evidence.push(
        createEvidence('file-not-found', `Could not parse file`, -10, filePath)
      );
    }

    return evidence;
  }

  /**
   * Determine feature gap status
   * @param accuracyScore - Accuracy score
   * @param evidence - Evidence
   * @returns Feature gap status
   */
  private determineStatus(accuracyScore: number, evidence: Evidence[]): FeatureGapStatus {
    const hasStub = evidence.some(e => e.type === 'returns-guidance-text');
    const hasImplementation = evidence.some(e => e.type === 'exact-function-match');

    if (accuracyScore >= 85 && hasImplementation && !hasStub) {
      return 'accurate';
    } else if (accuracyScore < 30 || (hasStub && !hasImplementation)) {
      return 'false';
    } else {
      return 'misleading';
    }
  }

  /**
   * Determine reality vs claim
   * @param evidence - Evidence
   * @param accuracyScore - Accuracy score
   * @returns Reality description
   */
  private determineReality(evidence: Evidence[], accuracyScore: number): string {
    const hasStub = evidence.some(e => e.type === 'returns-guidance-text');
    const hasImplementation = evidence.some(e => e.type === 'exact-function-match');
    const hasSimilarity = evidence.some(e => e.type === 'name-similarity-only');

    if (hasStub) {
      return 'Only stub implementation exists';
    } else if (hasImplementation) {
      return 'Partial implementation exists';
    } else if (hasSimilarity) {
      return 'Related code exists but claim is overstated';
    } else {
      return 'No implementation found';
    }
  }

  /**
   * Generate recommendation
   * @param status - Feature gap status
   * @param accuracyScore - Accuracy score
   * @returns Recommendation
   */
  private generateRecommendation(
    status: FeatureGapStatus,
    accuracyScore: number
  ): FeatureGapRecommendation {
    if (status === 'false') {
      return 'remove-claim';
    } else if (status === 'misleading' && accuracyScore < 50) {
      return 'update-documentation';
    } else {
      return 'implement-feature';
    }
  }

  /**
   * Check if text is a feature claim
   * @param text - Text to check
   * @returns True if it's a feature claim
   */
  private isFeatureClaim(text: string): boolean {
    const lower = text.toLowerCase();

    // Skip changelog entries
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return false;

    // Skip version numbers
    if (/^v?\d+\.\d+/.test(text)) return false;

    // Skip TODOs and notes
    if (lower.includes('todo') || lower.includes('note:')) return false;

    // Look for action verbs and capability statements
    const featureIndicators = [
      'supports',
      'enables',
      'provides',
      'allows',
      'can',
      'analyzes',
      'generates',
      'detects',
      'automatically',
      'intelligent',
      'advanced',
      'complete',
      'full',
      'comprehensive',
    ];

    return featureIndicators.some(indicator => lower.includes(indicator));
  }

  /**
   * Extract related features from claim text
   * @param claim - Claim text
   * @returns Array of related feature names
   */
  private extractRelatedFeatures(claim: string): string[] {
    const features: string[] = [];

    // Look for capitalized terms that might be features
    const matches = claim.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
    if (matches) {
      features.push(...matches);
    }

    // Look for quoted terms
    const quotedMatches = claim.match(/"([^"]+)"/g);
    if (quotedMatches) {
      features.push(...quotedMatches.map(m => m.replace(/"/g, '')));
    }

    return features;
  }

  /**
   * Extract keywords from text
   * @param text - Text to extract keywords from
   * @returns Array of keywords
   */
  private extractKeywords(text: string): string[] {
    const commonWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'were',
      'be',
      'been',
      'being',
    ];

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !commonWords.includes(w));

    return [...new Set(words)].sort((a, b) => b.length - a.length);
  }

  /**
   * Log message if verbose
   * @param message - Message to log
   */
  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[FeatureAnalyzer] ${message}`);
    }
  }
}

/**
 * Create a FeatureAnalyzer instance
 */
export function createFeatureAnalyzer(config?: FeatureAnalyzerConfig): FeatureAnalyzer {
  return new FeatureAnalyzer(config);
}
