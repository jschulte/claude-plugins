/**
 * BMAD Spec Parser
 * Parses BMAD-format specs (prd.md, architecture.md, epics.md) into ParsedSpec format
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import yaml from 'js-yaml';
import { SpecParsingError } from '../../types/errors.js';
import type {
  ParsedSpec,
  Requirement,
  AcceptanceCriterion,
  SpecPhase,
  Priority,
} from '../../types/roadmap.js';
import type {
  BmadFrontmatter,
  BmadEpic,
  BmadStory,
  BmadArchitecture,
  BmadApiContract,
  BmadDataModel,
  BmadAdr,
} from '../../types/spec-format.js';
import { BMAD_SPEC_FILES } from '../../types/spec-format.js';

/**
 * BMAD Spec Parser
 * Parses BMAD-format specifications into unified ParsedSpec format
 */
export class BmadSpecParser {
  /**
   * Parse all BMAD specs from a directory
   * @param bmadDir - Path to BMAD output directory (planning-artifacts)
   * @param includeArchitecture - Whether to parse architecture.md (for Brownfield)
   * @returns Array of parsed specifications
   */
  async parseSpecs(bmadDir: string, includeArchitecture = false): Promise<ParsedSpec[]> {
    const specs: ParsedSpec[] = [];

    try {
      // Parse PRD for functional/non-functional requirements
      const prdPath = path.join(bmadDir, BMAD_SPEC_FILES.prd);
      if (await this.fileExists(prdPath)) {
        const prdSpec = await this.parsePrd(prdPath);
        specs.push(prdSpec);
      }

      // Parse epics for additional specs (one per epic)
      const epicsPath = path.join(bmadDir, BMAD_SPEC_FILES.epics);
      if (await this.fileExists(epicsPath)) {
        const epicSpecs = await this.parseEpics(epicsPath);
        specs.push(...epicSpecs);
      }

      // Parse architecture for Brownfield projects
      if (includeArchitecture) {
        const archPath = path.join(bmadDir, BMAD_SPEC_FILES.architecture);
        if (await this.fileExists(archPath)) {
          const archSpecs = await this.parseArchitecture(archPath);
          specs.push(...archSpecs);
        }
      }

      // Parse sprint artifacts if present
      const sprintDir = path.join(bmadDir, '..', 'implementation-artifacts', 'sprint-artifacts');
      if (await this.directoryExists(sprintDir)) {
        const sprintSpecs = await this.parseSprintArtifacts(sprintDir);
        specs.push(...sprintSpecs);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new SpecParsingError(bmadDir, message);
    }

    return specs;
  }

  /**
   * Parse PRD.md into ParsedSpec format
   */
  async parsePrd(prdPath: string): Promise<ParsedSpec> {
    const content = await fs.readFile(prdPath, 'utf-8');
    const frontmatter = this.extractFrontmatter(content);
    const bodyContent = this.stripFrontmatter(content);

    return {
      id: 'PRD',
      title: this.extractTitle(bodyContent) || 'Product Requirements Document',
      path: prdPath,
      status: this.determineStatus(frontmatter),
      priority: 'P0', // PRD is always high priority
      effort: '',
      functionalRequirements: this.extractBmadRequirements(bodyContent, 'FR'),
      nonFunctionalRequirements: this.extractBmadRequirements(bodyContent, 'NFR'),
      acceptanceCriteria: [],
      successCriteria: this.extractSuccessCriteria(bodyContent),
      phases: [],
    };
  }

  /**
   * Parse epics.md into multiple ParsedSpec objects (one per epic)
   */
  async parseEpics(epicsPath: string): Promise<ParsedSpec[]> {
    const content = await fs.readFile(epicsPath, 'utf-8');
    const epics = this.extractEpics(content);

    return epics.map(epic => ({
      id: epic.id,
      title: epic.title,
      path: epicsPath,
      status: 'active',
      priority: epic.priority,
      effort: '',
      functionalRequirements: epic.stories.map(story => ({
        id: story.id,
        title: story.title,
        priority: story.priority,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria,
      })),
      nonFunctionalRequirements: [],
      acceptanceCriteria: this.storiesToAcceptanceCriteria(epic.stories),
      successCriteria: [],
      phases: this.storiesToPhases(epic.stories),
    }));
  }

  /**
   * Parse architecture.md for technical requirements (Brownfield only)
   */
  async parseArchitecture(archPath: string): Promise<ParsedSpec[]> {
    const content = await fs.readFile(archPath, 'utf-8');
    const arch = this.extractArchitectureComponents(content);
    const specs: ParsedSpec[] = [];

    // Create spec for API contracts
    if (arch.apiContracts.length > 0) {
      specs.push({
        id: 'ARCH-API',
        title: 'API Contracts',
        path: archPath,
        status: 'defined',
        priority: 'P1',
        effort: '',
        functionalRequirements: arch.apiContracts.map((contract, i) => ({
          id: `API${i + 1}`,
          title: `${contract.method} ${contract.path}`,
          priority: 'P1' as Priority,
          description: contract.description,
          acceptanceCriteria: [
            `Endpoint ${contract.method} ${contract.path} exists`,
            contract.request ? `Accepts request: ${contract.request}` : '',
            contract.response ? `Returns response: ${contract.response}` : '',
          ].filter(Boolean),
        })),
        nonFunctionalRequirements: [],
        acceptanceCriteria: [],
        successCriteria: [],
        phases: [],
      });
    }

    // Create spec for data models
    if (arch.dataModels.length > 0) {
      specs.push({
        id: 'ARCH-DATA',
        title: 'Data Models',
        path: archPath,
        status: 'defined',
        priority: 'P1',
        effort: '',
        functionalRequirements: arch.dataModels.map((model, i) => ({
          id: `MODEL${i + 1}`,
          title: model.name,
          priority: 'P1' as Priority,
          description: model.description,
          acceptanceCriteria: model.fields.map(f => `Field: ${f}`),
        })),
        nonFunctionalRequirements: [],
        acceptanceCriteria: [],
        successCriteria: [],
        phases: [],
      });
    }

    return specs;
  }

  /**
   * Parse sprint artifact files (story files)
   */
  async parseSprintArtifacts(sprintDir: string): Promise<ParsedSpec[]> {
    const specs: ParsedSpec[] = [];

    try {
      const files = await fs.readdir(sprintDir);

      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(sprintDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const spec = this.parseStoryFile(content, filePath, file);
          if (spec) {
            specs.push(spec);
          }
        }
      }
    } catch {
      // Sprint artifacts directory may not exist
    }

    return specs;
  }

  /**
   * Extract BMAD-style requirements (FR1, FR2, NFR1, NFR2 sections)
   */
  private extractBmadRequirements(content: string, prefix: string): Requirement[] {
    const requirements: Requirement[] = [];

    // BMAD uses patterns like:
    // - "## FR1: Title" or "### FR1: Title"
    // - "## Functional Requirement 1: Title"
    // - Numbered lists under "Functional Requirements" section

    // Pattern 1: "## FR1: Title" format
    const headerPattern = new RegExp(
      `###+\\s+${prefix}(\\d+):?\\s+(.+?)\\n([\\s\\S]*?)(?=###+\\s+(?:${prefix}|NFR|FR)|##[^#]|$)`,
      'gi'
    );

    let match;
    while ((match = headerPattern.exec(content)) !== null) {
      const id = `${prefix}${match[1]}`;
      const title = match[2].trim();
      const sectionContent = match[3];

      // Skip if we already have this requirement
      if (requirements.find(r => r.id === id)) continue;

      requirements.push({
        id,
        title,
        priority: this.extractPriorityFromSection(sectionContent),
        description: this.extractDescription(sectionContent),
        acceptanceCriteria: this.extractAcceptanceCriteriaFromBmad(sectionContent),
      });
    }

    // Pattern 2: "Functional Requirements" section with numbered items
    const sectionName = prefix === 'FR' ? 'Functional Requirements' : 'Non-Functional Requirements';
    const sectionMatch = content.match(
      new RegExp(`##\\s+${sectionName}[\\s\\S]*?(?=##[^#]|$)`, 'i')
    );

    if (sectionMatch) {
      const sectionContent = sectionMatch[0];
      const itemPattern = /[-*]\s+\*\*([^:*]+):\*\*\s*(.+?)(?=\n[-*]|\n\n|$)/g;

      let itemNum = requirements.length + 1;
      let itemMatch;
      while ((itemMatch = itemPattern.exec(sectionContent)) !== null) {
        const id = `${prefix}${itemNum}`;
        const title = itemMatch[1].trim();
        const description = itemMatch[2].trim();

        // Skip if already exists
        if (!requirements.find(r => r.title === title)) {
          requirements.push({
            id,
            title,
            priority: 'P2',
            description,
            acceptanceCriteria: [],
          });
          itemNum++;
        }
      }
    }

    return requirements;
  }

  /**
   * Extract epics from epics.md
   */
  private extractEpics(content: string): BmadEpic[] {
    const epics: BmadEpic[] = [];

    // BMAD epics format:
    // ## Epic 1: Title
    // ### Story 1.1: Title
    const epicRegex = /##\s+Epic\s*(\d+):?\s+(.+?)\n([\s\S]*?)(?=##\s+Epic|$)/gi;

    let match;
    while ((match = epicRegex.exec(content)) !== null) {
      const epicNum = match[1];
      const epicTitle = match[2].trim();
      const epicContent = match[3];

      const stories = this.extractStories(epicContent, epicNum);

      epics.push({
        id: `E${epicNum}`,
        title: epicTitle,
        description: this.extractDescription(epicContent),
        stories,
        priority: this.extractPriorityFromSection(epicContent),
      });
    }

    return epics;
  }

  /**
   * Extract stories from an epic section
   */
  private extractStories(content: string, epicNum: string): BmadStory[] {
    const stories: BmadStory[] = [];

    // Match "### Story 1.1: Title" or "### Story 1: Title"
    const storyRegex = /###\s+Story\s*(\d+(?:\.\d+)?):?\s+(.+?)\n([\s\S]*?)(?=###|$)/gi;

    let match;
    while ((match = storyRegex.exec(content)) !== null) {
      const storyNum = match[1];
      const storyTitle = match[2].trim();
      const storyContent = match[3];

      stories.push({
        id: `S${epicNum}.${storyNum}`,
        title: storyTitle,
        description: this.extractUserStory(storyContent),
        acceptanceCriteria: this.extractAcceptanceCriteriaFromBmad(storyContent),
        tasks: this.extractTasks(storyContent),
        priority: this.extractPriorityFromSection(storyContent),
      });
    }

    return stories;
  }

  /**
   * Extract architecture components
   */
  private extractArchitectureComponents(content: string): BmadArchitecture {
    return {
      apiContracts: this.extractApiContracts(content),
      dataModels: this.extractDataModels(content),
      adrs: this.extractAdrs(content),
    };
  }

  /**
   * Extract API contracts from architecture.md
   */
  private extractApiContracts(content: string): BmadApiContract[] {
    const contracts: BmadApiContract[] = [];

    // Look for API section
    const apiMatch = content.match(/##\s+(?:API\s+)?Contracts?[\s\S]*?(?=##[^#]|$)/i);
    if (!apiMatch) return contracts;

    const apiContent = apiMatch[0];

    // Match patterns like "### GET /api/users" or "- **POST /api/auth**"
    const endpointRegex = /(?:###\s+|\*\*)(GET|POST|PUT|DELETE|PATCH)\s+([^\s*]+)\*?\*?[:\s]*(.*?)(?=###|$)/gi;

    let match;
    while ((match = endpointRegex.exec(apiContent)) !== null) {
      contracts.push({
        method: match[1].toUpperCase(),
        path: match[2].trim(),
        description: match[3].trim(),
      });
    }

    return contracts;
  }

  /**
   * Extract data models from architecture.md
   */
  private extractDataModels(content: string): BmadDataModel[] {
    const models: BmadDataModel[] = [];

    // Look for Data Models section
    const dataMatch = content.match(/##\s+Data\s+Models?[\s\S]*?(?=##[^#]|$)/i);
    if (!dataMatch) return models;

    const dataContent = dataMatch[0];

    // Match model definitions like "### User" or "#### UserProfile"
    const modelRegex = /###\s+(\w+)\n([\s\S]*?)(?=###|$)/gi;

    let match;
    while ((match = modelRegex.exec(dataContent)) !== null) {
      const name = match[1].trim();
      const modelContent = match[2];

      // Extract fields from bullet lists
      const fields: string[] = [];
      const fieldRegex = /[-*]\s+\*?\*?(\w+)\*?\*?[:\s]+(.+)/g;
      let fieldMatch;
      while ((fieldMatch = fieldRegex.exec(modelContent)) !== null) {
        fields.push(`${fieldMatch[1]}: ${fieldMatch[2].trim()}`);
      }

      if (fields.length > 0) {
        models.push({
          name,
          description: this.extractDescription(modelContent),
          fields,
        });
      }
    }

    return models;
  }

  /**
   * Extract ADRs from architecture.md
   */
  private extractAdrs(content: string): BmadAdr[] {
    const adrs: BmadAdr[] = [];

    // Look for ADR or Architectural Decisions section
    const adrMatch = content.match(
      /##\s+(?:ADR|Architectural\s+Decision)s?[\s\S]*?(?=##[^#]|$)/i
    );
    if (!adrMatch) return adrs;

    const adrContent = adrMatch[0];

    // Match ADR entries like "### ADR-001: Title" or "### Decision: Title"
    const adrRegex = /###\s+(?:ADR[-_]?(\d+):?\s+)?(.+?)\n([\s\S]*?)(?=###|$)/gi;

    let num = 1;
    let match;
    while ((match = adrRegex.exec(adrContent)) !== null) {
      const id = match[1] ? `ADR-${match[1]}` : `ADR-${num}`;
      const title = match[2].trim();
      const adrBody = match[3];

      adrs.push({
        id,
        title,
        context: this.extractSubsection(adrBody, 'Context'),
        decision: this.extractSubsection(adrBody, 'Decision'),
        rationale: this.extractSubsection(adrBody, 'Rationale'),
      });

      num++;
    }

    return adrs;
  }

  /**
   * Extract frontmatter from BMAD file
   */
  private extractFrontmatter(content: string): BmadFrontmatter {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    try {
      return yaml.load(match[1]) as BmadFrontmatter;
    } catch {
      return {};
    }
  }

  /**
   * Strip frontmatter from content
   */
  private stripFrontmatter(content: string): string {
    return content.replace(/^---\n[\s\S]*?\n---\n?/, '');
  }

  /**
   * Extract title from content (first H1)
   */
  private extractTitle(content: string): string {
    const match = content.match(/^#\s+(.+?)$/m);
    return match ? match[1].trim() : '';
  }

  /**
   * Determine status from frontmatter
   */
  private determineStatus(frontmatter: BmadFrontmatter): string {
    if (!frontmatter.stepsCompleted || frontmatter.stepsCompleted.length === 0) {
      return 'draft';
    }
    if (frontmatter.lastStep && frontmatter.stepsCompleted.includes(frontmatter.lastStep)) {
      return 'complete';
    }
    return 'in-progress';
  }

  /**
   * Extract priority from section content
   */
  private extractPriorityFromSection(content: string): Priority {
    // Look for priority markers
    if (content.match(/priority:\s*P0|priority:\s*critical|must[-\s]?have/i)) return 'P0';
    if (content.match(/priority:\s*P1|priority:\s*high|should[-\s]?have/i)) return 'P1';
    if (content.match(/priority:\s*P2|priority:\s*medium|could[-\s]?have/i)) return 'P2';
    if (content.match(/priority:\s*P3|priority:\s*low|won['']?t[-\s]?have/i)) return 'P3';
    return 'P2'; // Default
  }

  /**
   * Extract description (first paragraph of non-heading text)
   */
  private extractDescription(content: string): string {
    const lines = content.split('\n');
    const descLines: string[] = [];

    for (const line of lines) {
      // Skip headings, lists, priority markers
      if (line.startsWith('#')) continue;
      if (line.match(/^[-*]\s/)) continue;
      if (line.match(/^(priority|status|effort):/i)) continue;
      if (line.match(/^\*\*[A-Za-z]+:\*\*/)) continue;

      const trimmed = line.trim();
      if (trimmed) {
        descLines.push(trimmed);
      }

      // Stop after finding some description
      if (descLines.length >= 3) break;
    }

    return descLines.join(' ').trim();
  }

  /**
   * Extract user story format (As a... I want... So that...)
   */
  private extractUserStory(content: string): string {
    // Look for "As a" pattern
    const match = content.match(
      /\*?\*?As\s+a\*?\*?\s+(.+?)\s*\*?\*?I\s+want\*?\*?\s+(.+?)\s*\*?\*?So\s+that\*?\*?\s+(.+?)(?:\n|$)/i
    );

    if (match) {
      return `As a ${match[1].trim()}, I want ${match[2].trim()}, so that ${match[3].trim()}`;
    }

    return this.extractDescription(content);
  }

  /**
   * Extract acceptance criteria from BMAD format
   */
  private extractAcceptanceCriteriaFromBmad(content: string): string[] {
    const criteria: string[] = [];

    // Look for "Acceptance Criteria" section
    const acMatch = content.match(
      /(?:acceptance\s+criteria|ac)[\s:]*\n([\s\S]*?)(?=\n##|\n###|$)/i
    );

    if (acMatch) {
      const acContent = acMatch[1];
      const lines = acContent.split('\n');

      for (const line of lines) {
        // Match bullet points: "- [ ] Text" or "- Text" or "* Text"
        const match = line.match(/^[-*]\s*(?:\[[ x]\])?\s*(.+)/);
        if (match && match[1].trim()) {
          criteria.push(match[1].trim());
        }

        // Match Given/When/Then format
        const gwtMatch = line.match(/^\*?\*?(Given|When|Then)\*?\*?\s+(.+)/i);
        if (gwtMatch) {
          criteria.push(`${gwtMatch[1]} ${gwtMatch[2].trim()}`);
        }
      }
    }

    return criteria;
  }

  /**
   * Extract tasks from content
   */
  private extractTasks(content: string): string[] {
    const tasks: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      // Match checkbox tasks: "- [ ] Task" or "- [x] Task"
      const match = line.match(/^[-*]\s*\[[ x]\]\s*(.+)/i);
      if (match && match[1].trim()) {
        tasks.push(match[1].trim());
      }
    }

    return tasks;
  }

  /**
   * Extract success criteria
   */
  private extractSuccessCriteria(content: string): string[] {
    const criteria: string[] = [];

    const match = content.match(
      /(?:success\s+(?:criteria|metrics)|kpis?)[\s:]*\n([\s\S]*?)(?=\n##|$)/i
    );

    if (match) {
      const lines = match[1].split('\n');
      for (const line of lines) {
        const bulletMatch = line.match(/^[-*]\s*(.+)/);
        if (bulletMatch && bulletMatch[1].trim()) {
          criteria.push(bulletMatch[1].trim());
        }
      }
    }

    return criteria;
  }

  /**
   * Extract a subsection by name
   */
  private extractSubsection(content: string, name: string): string {
    const match = content.match(
      new RegExp(`\\*\\*${name}:\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*|$)`, 'i')
    );
    return match ? match[1].trim() : '';
  }

  /**
   * Convert stories to acceptance criteria
   */
  private storiesToAcceptanceCriteria(stories: BmadStory[]): AcceptanceCriterion[] {
    return stories.flatMap(story =>
      story.acceptanceCriteria.map(ac => ({
        criterion: `${story.id}: ${ac}`,
        status: '' as const,
      }))
    );
  }

  /**
   * Convert stories to phases (grouped by priority)
   */
  private storiesToPhases(stories: BmadStory[]): SpecPhase[] {
    const phases: SpecPhase[] = [];
    const byPriority: Record<Priority, BmadStory[]> = {
      P0: [],
      P1: [],
      P2: [],
      P3: [],
    };

    for (const story of stories) {
      byPriority[story.priority].push(story);
    }

    const priorityOrder: Priority[] = ['P0', 'P1', 'P2', 'P3'];
    let phaseNum = 0;

    for (const priority of priorityOrder) {
      if (byPriority[priority].length > 0) {
        phases.push({
          number: phaseNum++,
          name: `${priority} Stories`,
          effort: '',
          status: 'Not Started',
          tasks: byPriority[priority].map(s => ({
            description: s.title,
            completed: false,
          })),
        });
      }
    }

    return phases;
  }

  /**
   * Parse a story file from sprint artifacts
   */
  private parseStoryFile(
    content: string,
    filePath: string,
    filename: string
  ): ParsedSpec | null {
    const frontmatter = this.extractFrontmatter(content);
    const bodyContent = this.stripFrontmatter(content);
    const title = this.extractTitle(bodyContent);

    if (!title) return null;

    // Extract story ID from filename (e.g., "1-1-user-registration.md")
    const idMatch = filename.match(/^(\d+)-(\d+)/);
    const id = idMatch ? `S${idMatch[1]}.${idMatch[2]}` : filename.replace('.md', '');

    return {
      id,
      title,
      path: filePath,
      status: frontmatter.status || this.determineStatus(frontmatter),
      priority: this.extractPriorityFromSection(bodyContent),
      effort: '',
      functionalRequirements: [
        {
          id: `${id}-FR1`,
          title,
          priority: this.extractPriorityFromSection(bodyContent),
          description: this.extractUserStory(bodyContent),
          acceptanceCriteria: this.extractAcceptanceCriteriaFromBmad(bodyContent),
        },
      ],
      nonFunctionalRequirements: [],
      acceptanceCriteria: this.extractAcceptanceCriteriaFromBmad(bodyContent).map(ac => ({
        criterion: ac,
        status: '' as const,
      })),
      successCriteria: [],
      phases: [],
    };
  }

  private async fileExists(p: string): Promise<boolean> {
    try {
      const stat = await fs.stat(p);
      return stat.isFile();
    } catch {
      return false;
    }
  }

  private async directoryExists(p: string): Promise<boolean> {
    try {
      const stat = await fs.stat(p);
      return stat.isDirectory();
    } catch {
      return false;
    }
  }
}

/**
 * Create a BmadSpecParser instance
 */
export function createBmadSpecParser(): BmadSpecParser {
  return new BmadSpecParser();
}
