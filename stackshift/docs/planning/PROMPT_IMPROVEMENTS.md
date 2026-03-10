# Recommended Prompt Improvements for StackShift

## Overview

After comprehensive review of the StackShift codebase, these prompt improvements would better align user expectations with actual capabilities and improve effectiveness.

## Critical Changes Needed

### 1. Set Clear Expectations Upfront

**Current Issue:** Prompts imply automated analysis and generation, but tools provide guidance only.

**Add to each prompt header:**

```markdown
## ⚠️ Important: How StackShift Works

StackShift is a **guided workflow tool** that helps you systematically reverse-engineer applications.

- **What it does:** Tracks progress, provides structured guidance, maintains state
- **What YOU do:** Execute the analysis, create the documentation, implement changes
- **Think of it as:** An expert consultant guiding you through the process

This prompt will guide you through [specific task] with clear instructions and templates.
```

### 2. Improve Initial Analysis Prompt (01-initial-analysis.md)

**Current:** Mix of bash commands and manual analysis
**Problem:** Doesn't guide proper use of Claude's capabilities

**Improved Version:**

```markdown
# Step 1: Initial Analysis - ENHANCED

## What This Step Achieves
Creates a comprehensive analysis report that forms the foundation for all subsequent steps.

## Preparation
Before starting, ensure you have:
- [ ] Access to the codebase
- [ ] Ability to run basic commands
- [ ] 5-10 minutes for analysis

## Analysis Instructions

### Phase 1: Technology Detection
Use the Glob and Grep tools (not bash) for better results:

1. **Find manifest files:**
   ```
   Use Glob tool with pattern: "**/package.json"
   Use Glob tool with pattern: "**/requirements.txt"
   Use Glob tool with pattern: "**/pom.xml"
   Use Glob tool with pattern: "**/go.mod"
   ```

2. **Detect frameworks from dependencies:**
   ```
   Use Read tool on package.json (if exists)
   Look for: react, angular, vue, express, next, etc.
   ```

3. **Count files by type:**
   ```
   Use Glob with: "**/*.js" (exclude node_modules)
   Use Glob with: "**/*.py" (exclude __pycache__)
   Use Glob with: "**/*.java"
   ```

### Phase 2: Architecture Analysis
Instead of just listing directories:

1. **Identify architecture pattern:**
   - Look for: /src, /api, /components, /services
   - Check for: microservices (multiple package.json), monorepo (lerna/nx)
   - Identify: MVC, layered, hexagonal patterns

2. **Find critical configuration:**
   ```
   Use Glob: "**/.env*" (check for environment configs)
   Use Glob: "**/config/**/*.{json,yaml,yml}"
   ```

### Phase 3: Completeness Assessment
Don't just guess - analyze systematically:

1. **Check for tests:**
   ```
   Use Glob: "**/*.test.{js,ts}" or "**/*.spec.{js,ts}"
   Count test files vs source files ratio
   ```

2. **Check for documentation:**
   ```
   Use Glob: "**/*.md"
   Check for: README, CONTRIBUTING, API docs
   ```

3. **Check for CI/CD:**
   ```
   Use Glob: ".github/workflows/*.yml"
   Use Glob: ".gitlab-ci.yml"
   Use Glob: "Jenkinsfile"
   ```

### Phase 4: Generate Report
Create `analysis-report.md` with ACTIONABLE insights:

```markdown
# Initial Analysis Report

## Quick Summary
- **Readiness:** [X]% complete (based on actual findings)
- **Tech Stack:** [Detected stack]
- **Architecture:** [Pattern identified]
- **Next Steps:** [Specific recommendations]

## Detailed Findings

### Technology Stack
| Component | Technology | Version | Confidence |
|-----------|-----------|---------|------------|
| Language | JavaScript | ES2022 | High (package.json) |
| Framework | React | 18.2.0 | High (package.json) |
| Build | Webpack | 5.x | Medium (config found) |

### Architecture Assessment
- **Pattern:** [e.g., Component-based SPA with REST API]
- **Layers:** [Frontend, API Gateway, Services, Database]
- **Key Directories:**
  - `/src/components` - React components (47 files)
  - `/src/services` - Business logic (12 files)
  - `/src/api` - API integration (8 files)

### Completeness Score: [X]/100
- ✅ Tests found (23 test files, ~40% coverage estimated)
- ✅ README exists with setup instructions
- ⚠️ No API documentation found
- ❌ No deployment configuration
- ❌ Missing error handling in 60% of files

### Recommendations for Reverse Engineering
Based on this analysis, you should:
1. Focus on [specific area] first
2. Document [missing piece] as priority
3. Path: [Greenfield/Brownfield] recommended because [reason]
```
```

### 3. Fix Reverse Engineering Prompt (02-reverse-engineer.md)

**Current:** Implies automatic generation of 8 documents
**Reality:** Provides guidance for manual creation

**Improved Version:**

```markdown
# Step 2: Reverse Engineer - GUIDED DOCUMENTATION

## Reality Check
This step guides you through creating 8 comprehensive documents. You will:
- Analyze code systematically (30-45 minutes)
- Create documentation following templates (30-45 minutes)
- Total time: 60-90 minutes of focused work

## Document Creation Strategy

### Use Claude's Tools Effectively

Instead of generic exploration, use targeted searches:

1. **For Functional Specification:**
   ```
   # Find all API endpoints
   Use Grep: "router\.(get|post|put|delete)" with pattern "routes/**/*.js"

   # Find React components
   Use Glob: "**/components/**/*.{jsx,tsx}"

   # Find business logic
   Use Grep: "class.*Service" or "export.*Service"
   ```

2. **For Data Architecture:**
   ```
   # Find database schemas
   Use Glob: "**/models/**/*.{js,ts}"
   Use Glob: "**/schemas/**/*.{js,ts}"
   Use Read: "prisma/schema.prisma" (if exists)

   # Find migrations
   Use Glob: "**/migrations/**/*"
   ```

### Document Templates with Examples

#### 1. functional-specification.md

**Don't write:** "The system shall provide user authentication"
**Do write:**
```markdown
## FR-001: User Authentication
**Priority:** P0
**User Story:** As a user, I want to log in with email/password so that I can access my personal dashboard

### Current Implementation:
- POST /api/auth/login - Accepts email, password
- Returns: JWT token (expires 24h)
- Stores: User session in Redis
- Password: Bcrypt with 10 rounds

### Business Rules:
- BR-001: Email must be verified before login
- BR-002: 5 failed attempts trigger 15-min lockout
- BR-003: Password must be 8+ chars with 1 number

### Test Coverage:
- ✅ Unit tests: /tests/auth.test.js (8 tests)
- ⚠️ No integration tests found
- ❌ No E2E tests found
```

#### 2. data-architecture.md

**Don't write:** "Uses a database for data storage"
**Do write:**
```markdown
## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Current State:
- Database: PostgreSQL 14 (from docker-compose.yml)
- ORM: Prisma 4.0 (from package.json)
- Migrations: 12 found in /prisma/migrations
- Indexes: email (unique), created_at (btree)

### Data Flow:
1. Client → POST /api/users → UserService.create()
2. UserService → Validation → Prisma.user.create()
3. PostgreSQL → Return → Transform DTO → Client
```
```

### 4. Improve Completion Guidance (05-complete-specification.md)

**Add Clarification Strategy:**

```markdown
## Handling [NEEDS CLARIFICATION] Markers

### Strategy Options

1. **Immediate Resolution** (Recommended for small projects)
   - Stop at each marker
   - Research or make educated guess
   - Document assumption clearly
   - Example:
     ```markdown
     Authentication Method: JWT
     [ASSUMPTION: Based on jsonwebtoken in package.json, assuming standard JWT flow]
     ```

2. **Batch Resolution** (Recommended for large projects)
   - Complete entire document with markers
   - Create clarification list
   - Research/resolve in batches
   - Update documents in one pass

3. **Assumption-Based** (When blocked)
   - Make reasonable assumptions
   - Document clearly
   - Mark as "ASSUMPTION:" in caps
   - Create assumptions.md file

### Common Clarifications and How to Resolve

| Marker | How to Resolve | Example |
|--------|---------------|---------|
| [NEEDS CLARIFICATION: Database choice] | Check docker-compose.yml, connection strings, or package.json for database drivers | Found: pg package = PostgreSQL |
| [NEEDS CLARIFICATION: Deployment target] | Check for Dockerfile, .github/workflows, or cloud config files | Found: Dockerfile + k8s/ folder = Kubernetes |
| [NEEDS CLARIFICATION: Auth strategy] | Look for passport, auth0, JWT packages | Found: passport-local = Username/password |
```

### 5. Add Language-Specific Guidance

**Create prompts/languages/ directory with specific guides:**

```markdown
# JavaScript/TypeScript Specific Guide

## What to Look For

### Framework Detection
```javascript
// React indicators:
- import React from 'react'
- JSX syntax (<Component />)
- useState, useEffect hooks

// Vue indicators:
- .vue file extensions
- <template>, <script>, <style> blocks
- export default { data() {} }

// Angular indicators:
- @Component decorators
- .component.ts files
- NgModule imports
```

### Common Patterns
1. **Express.js API:**
   - Look in: /routes, /controllers, /middleware
   - Pattern: router.METHOD(path, ...middleware, handler)

2. **React SPA:**
   - Look in: /src/components, /src/pages
   - Pattern: Functional components with hooks

3. **Node.js Service:**
   - Look in: /services, /lib, /utils
   - Pattern: Class-based or functional exports
```

### 6. Add Progress Tracking

**Add to each prompt:**

```markdown
## Progress Tracking

### How to Track Your Progress

1. **Create a checklist file** (`progress.md`):
   ```markdown
   # StackShift Progress Tracker

   ## Gear 1: Analysis ✅
   - [x] Technology detection
   - [x] Architecture analysis
   - [x] Completeness assessment
   - [x] Created analysis-report.md

   ## Gear 2: Reverse Engineering ⏳
   - [x] Functional specification
   - [ ] Data architecture
   - [ ] Configuration reference
   - [ ] Operations guide
   - [ ] Technical debt analysis
   - [ ] Observability requirements
   - [ ] Visual design system
   - [ ] Test documentation
   ```

2. **Time tracking** (optional):
   ```markdown
   ## Time Log
   - Gear 1: 8 min (started 10:00am)
   - Gear 2: 45 min (in progress)
   ```

3. **Blockers and questions:**
   ```markdown
   ## Blockers
   - Cannot find database schema (no migrations folder)
   - Unclear authentication flow (multiple auth libraries)
   ```
```

### 7. Add Troubleshooting Sections

**Add to each prompt:**

```markdown
## Common Issues and Solutions

### Issue: "Can't find any API endpoints"
**Solutions:**
1. Try different patterns:
   - Express: `app.get`, `router.post`
   - Next.js: Check /pages/api or /app/api
   - GraphQL: Look for .graphql files or schema definitions

2. Check for API gateway or proxy:
   - nginx.conf, apache configs
   - API Gateway configurations

### Issue: "Too many files to analyze"
**Solutions:**
1. Focus on core directories first:
   - Ignore: node_modules, dist, build, .git
   - Prioritize: src, app, lib, components

2. Use sampling strategy:
   - Analyze 5-10 files per directory
   - Focus on index files and main components

### Issue: "Can't determine architecture"
**Solutions:**
1. Look for architecture indicators:
   - Dockerfile → Microservices likely
   - Single package.json → Monolithic likely
   - Multiple package.json → Monorepo or microservices

2. Check README or docs folder for architecture diagrams
```

## Summary of Key Improvements

1. **Set realistic expectations** - Make clear this is guided, not automated
2. **Use Claude's tools properly** - Glob/Grep/Read instead of bash commands
3. **Provide concrete examples** - Show actual code/config snippets
4. **Add troubleshooting** - Help users when they get stuck
5. **Include progress tracking** - Keep users motivated and organized
6. **Language-specific guidance** - Targeted advice per tech stack
7. **Clarification strategies** - Clear approaches for handling unknowns

These improvements would significantly enhance the user experience and success rate with StackShift.