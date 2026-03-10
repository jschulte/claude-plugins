# Greenfield/Brownfield Path Split - Complete! 🎉

## What We Built

Your reverse engineering toolkit now supports **two distinct workflows** based on user goals:

---

## Path A: Greenfield (Tech-Agnostic)

**Goal:** Extract business logic to rebuild in a different tech stack

### What Gets Extracted
✅ Business requirements (WHAT the system does)
✅ User stories and workflows
✅ Business rules and validation logic
✅ Data relationships (not database schema)
✅ Non-functional requirements (performance goals, not implementation)

❌ Framework names (Express, React, etc.)
❌ Library details (bcrypt, jose, etc.)
❌ Database technology (PostgreSQL vs MongoDB)
❌ File paths and code structure

### Example Output

**Specification:**
```markdown
# Feature: User Authentication

## Business Requirement
Users must be able to create accounts and log in securely.

## Acceptance Criteria
- User can register with email/password
- Passwords must meet complexity requirements (8+ chars, number, special char)
- Sessions expire after 24 hours of inactivity
- Failed login attempts are rate-limited

## Business Rules
- Email addresses must be unique
- Passwords must be hashed (algorithm: implementation choice)
- Users must verify email before full access
```

**Note:** No mention of JWT, Express, bcrypt, Next.js, etc.

### Use Cases
- 🔄 Rails → Next.js migration
- 📱 Web → Mobile app (same business logic)
- ♻️ Complete rebuild with new architecture
- 🎯 Let new team choose their stack

---

## Path B: Brownfield (Tech-Prescriptive)

**Goal:** Manage existing codebase with GitHub Spec Kit

### What Gets Extracted
✅ Business requirements (WHAT)
✅ Technical implementation (HOW)
✅ Exact framework and library versions
✅ Database schemas with ORM details
✅ File paths and code structure
✅ Configuration and environment variables
✅ Current state vs ideal state

### Example Output

**Specification:**
```markdown
# Feature: User Authentication

## Business Requirement
Users must be able to create accounts and log in securely.

## Current Implementation

### Tech Stack
- **Framework:** Next.js 14.0.3 (App Router)
- **Auth Library:** jose 5.1.0 (JWT)
- **Password Hashing:** bcrypt 5.1.1 (cost: 10)
- **Session Storage:** JWT in httpOnly cookie
- **Token Expiry:** 24 hours (via JWT_EXPIRY env var)

### API Endpoints
- POST /api/auth/register
  - Handler: `app/api/auth/register/route.ts`
  - Validation: Zod schema (`lib/validation/auth.ts`)
- POST /api/auth/login
  - Handler: `app/api/auth/login/route.ts`
  - Rate limiting: 10 attempts/hour (via @upstash/ratelimit)

### Database Schema
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
}
```

### Implementation Files
- app/api/auth/register/route.ts
- app/api/auth/login/route.ts
- lib/auth/jwt.ts (jose library)
- lib/auth/password.ts (bcrypt)

### Dependencies
- jose: 5.1.0
- bcrypt: 5.1.1
- zod: 3.22.4
```

**Note:** Exact versions, file paths, implementation details documented.

### Use Cases
- 📋 Add Spec Kit to existing app
- ✅ Validate specs match code (`/speckit.analyze`)
- ⬆️ Manage upgrades (Next.js 14 → 15 via specs)
- 🔧 Gradual refactoring with validation
- 👥 Onboarding (prescriptive docs)

---

## Workflow Comparison

### Greenfield Workflow

```bash
# Step 1: Analyze
> "Analyze this codebase"
  → Path selection: Choose Greenfield
  → Stored: path = "greenfield"

# Step 2: Reverse Engineer (Business Only)
> "Reverse engineer the codebase"
  → Extracts: User stories, business rules
  → Avoids: Framework names, library versions
  → Output: 8 docs focused on business logic

# Step 3: Create Agnostic Specs
> "Create specifications"
  → Uses: constitution-agnostic-template.md
  → Creates: .specify/ with business requirements
  → No tech constraints

# Step 6: Implement in NEW Stack
> "Implement in Next.js"
  → Choose ANY tech stack
  → Build from business requirements
  → No constraints from old implementation
```

### Brownfield Workflow

```bash
# Step 1: Analyze
> "Analyze this codebase"
  → Path selection: Choose Brownfield
  → Stored: path = "brownfield"

# Step 2: Reverse Engineer (Full Stack)
> "Reverse engineer the codebase"
  → Extracts: Business logic + tech implementation
  → Captures: Exact versions, file paths, configs
  → Output: 8 docs with complete technical details

# Step 3: Create Prescriptive Specs
> "Create specifications"
  → Uses: constitution-prescriptive-template.md
  → Creates: .specify/ with business + tech requirements
  → Documents current implementation exactly

# Step 4: Validate Current State
> /speckit.analyze
  ✅ Shows: ~100% aligned (specs match code)

# Later: Upgrade Next.js
  → Update spec: Next.js 14 → 15
  → Run /speckit.analyze → Shows gap
  → Run /speckit.implement upgrade-nextjs → Executes upgrade
  → Validate: /speckit.analyze → Shows ✅ aligned
```

---

## Files Created

### Prompts (10 files changed)
1. `prompts/greenfield/README.md` - Greenfield path explanation
2. `prompts/greenfield/02-reverse-engineer-business-logic.md` - Business logic extraction
3. `prompts/brownfield/README.md` - Brownfield path explanation
4. `prompts/brownfield/02-reverse-engineer-full-stack.md` - Full stack extraction

### Templates (2 new templates)
5. `plugin/templates/constitution-agnostic-template.md` - Tech-agnostic constitution
6. `plugin/templates/constitution-prescriptive-template.md` - Tech-prescriptive constitution

### Skills (4 updated)
7. `plugin/skills/analyze/SKILL.md` - Added path selection question
8. `plugin/skills/reverse-engineer/SKILL.md` - Path-aware extraction
9. `.stackshift-state.json` - Path tracking
10. `README.md` - Comprehensive path comparison and guide

**Total:** 2,429 insertions, 51 deletions

---

## State Tracking

Path choice stored in `.stackshift-state.json`:

```json
{
  "version": "1.0.0",
  "path": "brownfield",
  "metadata": {
    "pathDescription": "Manage existing app with Spec Kit (tech-prescriptive)",
    "projectName": "my-app"
  },
  "currentStep": "reverse-engineer",
  "completedSteps": ["analyze"]
}
```

**Check State:**
```bash
# View current state including path
cat .stackshift-state.json
```

---

## User Experience

### Plugin Users

**Automatic path detection:**
```
User: "I want to reverse engineer this Rails app to rebuild it in Next.js"

Claude: 
Based on your goal (rebuilding in different stack), I recommend the 
Greenfield path which extracts business logic only.

Which path best aligns with your goals?
A) Greenfield: Build new app (tech-agnostic specs)
B) Brownfield: Manage existing app (tech-prescriptive specs)

User: A

Claude: [Sets path=greenfield, uses business-logic-only extraction]
```

### Manual Prompt Users

**Explicit choice:**
```bash
# Choose greenfield
cat prompts/greenfield/README.md              # Understand approach
cat prompts/greenfield/02-reverse-engineer-business-logic.md

# Or choose brownfield
cat prompts/brownfield/README.md              # Understand approach
cat prompts/brownfield/02-reverse-engineer-full-stack.md
```

---

## Benefits

### Greenfield Benefits
✅ Maximum flexibility - implement in any stack
✅ Portable specs - work across platforms
✅ Focus on business value, not legacy tech decisions
✅ Perfect for migrations and rebuilds
✅ No vendor lock-in

### Brownfield Benefits
✅ Automated validation - `/speckit.analyze` ensures alignment
✅ Upgrade management - change spec, validate gap, implement
✅ Complete documentation - exact current state captured
✅ Onboarding - prescriptive specs guide new developers
✅ No drift - specs and code stay synchronized

---

## Real-World Scenarios

### Scenario 1: Platform Migration
**Situation:** Rails monolith → Next.js microservices
**Path:** Greenfield
**Why:** Want to rebuild with modern stack, don't care about Rails specifics
**Result:** Tech-agnostic specs can be implemented in Next.js, or Python, or Go

### Scenario 2: Managing Existing App
**Situation:** Next.js app needs better structure and validation
**Path:** Brownfield
**Why:** Want to manage current codebase with specs
**Result:** Specs document exact current state, `/speckit.analyze` validates

### Scenario 3: Dependency Upgrades
**Situation:** Need to upgrade Next.js 14 → 15
**Path:** Brownfield
**Process:**
1. Update constitution: Next.js 14.0.3 → 15.0.0
2. `/speckit.analyze` shows gap
3. `/speckit.implement upgrade-nextjs` executes upgrade
4. Validate alignment

### Scenario 4: Team Flexibility
**Situation:** Handing off to new team with different stack preferences
**Path:** Greenfield
**Why:** Extract business requirements, let new team choose stack
**Result:** New team can use React, Vue, Svelte - all work from same specs

---

## Commits Pushed

**Commit 1:** `ae6b294` - Greenfield/brownfield path selection ⬅️ Just pushed!
**Commit 2:** `bf0eb1a` - Remove fishfan example
**Commit 3:** `7ff0625` - GitHub Spec Kit integration
**Commit 4:** `5a97fb9` - Plugin transformation

**Repository:** https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift

---

## What's Next

Your toolkit now provides:
✅ Complete Claude Code Plugin
✅ Full GitHub Spec Kit integration
✅ Dual workflow support (greenfield + brownfield)
✅ Path selection at start
✅ Automated state tracking
✅ Path-aware skill behavior

**Ready for:**
- Plugin marketplace publication
- User testing
- Community feedback
- Additional enhancements (VSCode extension, etc.)

The toolkit elegantly handles both "extract and rebuild" and "document and manage" use cases! 🚀
