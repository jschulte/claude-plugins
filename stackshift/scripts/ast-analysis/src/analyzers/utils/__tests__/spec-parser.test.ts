import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpecParser, createSpecParser } from '../spec-parser.js';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
  },
  readFile: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
}));

import * as fs from 'fs/promises';

const mockedReadFile = vi.mocked(fs.readFile);

describe('SpecParser', () => {
  const parser = new SpecParser();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseSpec', () => {
    it('extracts spec ID from title', async () => {
      mockedReadFile.mockResolvedValue(`# F008: Roadmap Generation

**Status:** Draft
**Priority:** P1
**Effort:** Medium
`);
      const spec = await parser.parseSpec('/specs/F008-roadmap/spec.md');
      expect(spec.id).toBe('F008');
    });

    it('extracts spec ID from filename when not in title', async () => {
      mockedReadFile.mockResolvedValue(`# Roadmap Generation

**Status:** Draft
**Priority:** P2
`);
      const spec = await parser.parseSpec('/specs/F008-roadmap/spec.md');
      expect(spec.id).toBe('F008');
    });

    it('extracts title without ID prefix', async () => {
      mockedReadFile.mockResolvedValue(`# F008: Roadmap Generation

**Status:** Active
`);
      const spec = await parser.parseSpec('/specs/F008-roadmap/spec.md');
      expect(spec.title).toBe('Roadmap Generation');
    });

    it('extracts metadata fields', async () => {
      mockedReadFile.mockResolvedValue(`# F001: Test Feature

**Status:** Active
**Priority:** P1
**Effort:** High
`);
      const spec = await parser.parseSpec('/specs/F001-test/spec.md');
      expect(spec.status).toBe('Active');
      expect(spec.effort).toBe('High');
    });

    it('extracts priority from metadata', async () => {
      mockedReadFile.mockResolvedValue(`# F001: Test

**Priority:** P0 - Critical
`);
      const spec = await parser.parseSpec('/specs/F001-test/spec.md');
      expect(spec.priority).toBe('P0');
    });

    it('defaults priority to P2 when not specified', async () => {
      mockedReadFile.mockResolvedValue(`# F001: Test

No priority here.
`);
      const spec = await parser.parseSpec('/specs/F001-test/spec.md');
      expect(spec.priority).toBe('P2');
    });

    it('extracts functional requirements', async () => {
      mockedReadFile.mockResolvedValue(`# F001: Test

### FR1: User Authentication
**Priority:** P1

Users must be able to log in.

### FR2: Dashboard
**Priority:** P2

Users see a dashboard after login.
`);
      const spec = await parser.parseSpec('/specs/F001-test/spec.md');
      expect(spec.functionalRequirements).toHaveLength(2);
      expect(spec.functionalRequirements[0].id).toBe('FR1');
      expect(spec.functionalRequirements[0].title).toBe('User Authentication');
      expect(spec.functionalRequirements[0].priority).toBe('P1');
    });

    it('extracts acceptance criteria with status markers', async () => {
      mockedReadFile.mockResolvedValue(`# F001: Test

## Acceptance Criteria

- ✅ User can log in
- ⚠️ Password reset partially working
- ❌ OAuth not implemented

## Next Section
`);
      const spec = await parser.parseSpec('/specs/F001-test/spec.md');
      expect(spec.acceptanceCriteria).toHaveLength(3);
      expect(spec.acceptanceCriteria[0].status).toBe('✅');
      expect(spec.acceptanceCriteria[0].criterion).toBe('User can log in');
      expect(spec.acceptanceCriteria[1].status).toBe('⚠');
      expect(spec.acceptanceCriteria[2].status).toBe('❌');
    });

    it('extracts phases with tasks', async () => {
      mockedReadFile.mockResolvedValue(`# F001: Test

### Phase 0: Foundation (2 days)

- [x] Set up project structure
- [x] Configure CI
- [ ] Write initial tests

### Phase 1: Implementation (1 week)

- [ ] Build core feature
- [ ] Add error handling
`);
      const spec = await parser.parseSpec('/specs/F001-test/spec.md');
      expect(spec.phases).toHaveLength(2);
      expect(spec.phases[0].number).toBe(0);
      expect(spec.phases[0].name).toBe('Foundation');
      expect(spec.phases[0].effort).toBe('2 days');
      expect(spec.phases[0].tasks).toHaveLength(3);
      expect(spec.phases[0].tasks[0].completed).toBe(true);
      expect(spec.phases[0].tasks[2].completed).toBe(false);
      expect(spec.phases[0].status).toBe('In Progress');
    });

    it('marks phase as Complete when all tasks done', async () => {
      mockedReadFile.mockResolvedValue(`# F001: Test

### Phase 0: Setup (1 day)

- [x] Task one
- [x] Task two
`);
      const spec = await parser.parseSpec('/specs/F001-test/spec.md');
      expect(spec.phases[0].status).toBe('Complete');
    });

    it('marks phase as Not Started when no tasks done', async () => {
      mockedReadFile.mockResolvedValue(`# F001: Test

### Phase 0: Setup (1 day)

- [ ] Task one
- [ ] Task two
`);
      const spec = await parser.parseSpec('/specs/F001-test/spec.md');
      expect(spec.phases[0].status).toBe('Not Started');
    });

    it('extracts success criteria from Success Metrics section', async () => {
      mockedReadFile.mockResolvedValue(`# F001: Test

### Success Metrics

- **Coverage:** 80% test coverage
- **Performance:** Sub-200ms response time

### Next Section
`);
      const spec = await parser.parseSpec('/specs/F001-test/spec.md');
      expect(spec.successCriteria).toHaveLength(2);
      expect(spec.successCriteria[0]).toContain('Coverage');
      expect(spec.successCriteria[1]).toContain('Performance');
    });

    it('throws SpecParsingError on read failure', async () => {
      mockedReadFile.mockRejectedValue(new Error('ENOENT'));
      await expect(parser.parseSpec('/bad/path/spec.md')).rejects.toThrow('Failed to parse spec');
    });
  });

  describe('createSpecParser', () => {
    it('returns a SpecParser instance', () => {
      const p = createSpecParser();
      expect(p).toBeInstanceOf(SpecParser);
    });
  });
});
