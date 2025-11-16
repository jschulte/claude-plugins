# Project Constitution (Tech-Prescriptive)

**Path:** Brownfield - Specifications for existing implementation
**Generated:** {{CURRENT_DATE}}
**Project:** {{PROJECT_NAME}}

---

## Purpose & Values

### Why This Project Exists
[Describe the business problem this application solves and the value it provides to users]

Example:
> This application helps aquarium hobbyists track and manage their fish care, providing insights into water quality, feeding schedules, and fish health to prevent common issues and improve fish welfare.

### Core Values
- **User-centric design** - Prioritize user needs and experience
- **Data accuracy** - Ensure reliable tracking and reporting
- **Privacy & security** - Protect user data
- **Simplicity** - Make complex tasks simple
- **Accessibility** - Available to all users regardless of ability

### Target Users
- Primary: Aquarium hobbyists (beginners to experts)
- Secondary: Aquarium stores (for customer support)
- Admin: System administrators

---

## Technical Architecture

### Technology Stack (Current Implementation)

#### Frontend
- **Framework:** Next.js 14.0.3 (App Router)
- **UI Library:** React 18.2.0
- **Language:** TypeScript 5.3.2
- **Styling:** Tailwind CSS 3.3.0
- **Component Library:** shadcn/ui (copy-paste components)
- **State Management:** React Context + Server Components
- **Forms:** React Hook Form 7.48.2 + Zod 3.22.4
- **HTTP Client:** Native fetch (Next.js)

#### Backend
- **Framework:** Next.js 14.0.3 API Routes (App Router)
- **Runtime:** Node.js 18.17.0
- **Language:** TypeScript 5.3.2
- **API Style:** RESTful HTTP API
- **Validation:** Zod 3.22.4

#### Database
- **Database:** PostgreSQL 15.3
- **ORM:** Prisma 5.6.0
- **Hosting:** Vercel Postgres (Neon.tech)
- **Migrations:** Prisma Migrate
- **Seeding:** prisma/seed.ts

#### Authentication
- **Method:** JWT (JSON Web Tokens)
- **Library:** jose 5.1.0
- **Password Hashing:** bcrypt 5.1.1 (cost: 10)
- **Session Storage:** JWT in httpOnly cookie
- **Token Expiry:** 24 hours (configurable)

#### External Services
- **Email:** SendGrid API (v3, @sendgrid/mail 7.7.0)
- **File Storage:** Vercel Blob Storage
- **Analytics:** Vercel Analytics
- **Error Tracking:** Not configured (TODO: Add Sentry)

#### Infrastructure
- **Hosting:** Vercel (Serverless Functions)
- **CI/CD:** GitHub Actions (.github/workflows/deploy.yml)
- **Domain:** Managed via Vercel
- **SSL:** Automatic (Vercel)
- **CDN:** Vercel Edge Network

#### Development Tools
- **Package Manager:** npm 10.2.3
- **Linter:** ESLint 8.54.0
- **Formatter:** Prettier 3.1.0
- **Type Checking:** TypeScript strict mode
- **Testing:** Vitest 1.0.4 (unit tests only)
- **Pre-commit:** Husky + lint-staged

---

## Technical Decisions & Rationale

### Why Next.js 14?
**Decision:** Use Next.js with App Router for full-stack application

**Rationale:**
- Server Components reduce client-side JavaScript
- Built-in routing eliminates need for React Router
- API Routes provide backend without separate server
- Vercel deployment is seamless
- Strong TypeScript support
- Large ecosystem and community

**Tradeoffs:**
- Vendor lock-in to Vercel ecosystem (mitigated: can deploy elsewhere)
- App Router is newer, less mature than Pages Router
- Learning curve for Server Components

### Why Serverless (Vercel)?
**Decision:** Deploy on Vercel using serverless functions

**Rationale:**
- Zero-config deployment from GitHub
- Automatic scaling (no capacity planning)
- Cost-effective for variable traffic
- Built-in CDN and edge caching
- Free tier suitable for MVP

**Tradeoffs:**
- Cold starts (mitigated: Vercel keeps functions warm)
- Not ideal for long-running processes
- Limited by function timeout (10s free, 60s pro)

### Why PostgreSQL + Prisma?
**Decision:** Use PostgreSQL via Prisma ORM

**Rationale:**
- Relational data model fits domain (users, fish, tanks, readings)
- ACID compliance for data integrity
- Prisma provides type-safe database access
- Excellent TypeScript integration
- Migration system built-in

**Tradeoffs:**
- More complex than NoSQL for simple cases
- Query performance requires indexing strategy
- Schema changes require migrations

### Why JWT Authentication?
**Decision:** Use JWT tokens in httpOnly cookies

**Rationale:**
- Stateless (no session storage required)
- Works well with serverless architecture
- Industry-standard approach
- httpOnly cookies prevent XSS attacks

**Tradeoffs:**
- Cannot revoke tokens before expiry
- Token size larger than session ID
- Need refresh token strategy for long sessions

---

## Development Standards

### Code Style
- **Linting:** ESLint with Next.js config
- **Formatting:** Prettier with 2-space indentation, single quotes, trailing commas
- **TypeScript:** Strict mode enabled, no `any` types
- **File naming:** kebab-case for files, PascalCase for components
- **Import order:** External → Internal → Relative

### Component Structure (Frontend)
```
app/                      # Next.js App Router
  (auth)/                # Route groups
    login/
      page.tsx           # Login page component
  api/                   # API routes
    auth/
      register/
        route.ts         # API endpoint handler
components/
  ui/                    # Reusable UI components
  features/              # Feature-specific components
lib/                     # Utilities and helpers
  auth/                  # Auth utilities
  db/                    # Database utilities
  validation/            # Zod schemas
```

### API Structure (Backend)
```
app/api/
  auth/
    register/route.ts    # POST /api/auth/register
    login/route.ts       # POST /api/auth/login
  users/
    route.ts             # GET /api/users (list)
    [id]/route.ts        # GET /api/users/:id (detail)
```

**Conventions:**
- route.ts exports GET, POST, PUT, DELETE, PATCH as needed
- Validation with Zod schemas
- Business logic in separate lib/ functions (not in route handlers)
- Error handling with try/catch, return NextResponse.json

### Database Conventions
- **Naming:** PascalCase for models, camelCase for fields
- **IDs:** CUID via @default(cuid())
- **Timestamps:** createdAt, updatedAt on all models
- **Soft delete:** NOT used (hard delete only)
- **Relationships:** Cascade delete where appropriate

### Testing Standards
- **Unit tests:** lib/ utility functions
- **Integration tests:** API routes (not yet implemented)
- **E2E tests:** Critical user flows (not yet implemented)
- **Coverage target:** 80% for business logic
- **Test naming:** *.test.ts colocated with source
- **Mocking:** Minimal mocking, prefer real test database

---

## Quality Standards

### Performance Targets (Current vs Target)
- **Page load:** Current ~1.5s, Target < 2s ✅
- **API response:** Current ~300ms, Target < 500ms ✅
- **Time to interactive:** Current ~2.5s, Target < 3s ✅
- **Lighthouse score:** Current 85, Target 90+

### Security Requirements (Current State)
- ✅ HTTPS enforced (Vercel automatic)
- ✅ Input validation (Zod on all inputs)
- ✅ Password hashing (bcrypt cost 10)
- ✅ httpOnly cookies for JWT
- ⚠️ Rate limiting (NOT implemented - HIGH PRIORITY)
- ⚠️ CSRF protection (NOT implemented - MEDIUM PRIORITY)
- ❌ Security headers (basic only, needs improvement)
- ❌ Error tracking (no Sentry yet)

### Reliability (Current State)
- ✅ Database backups (Vercel Postgres automatic daily)
- ⚠️ Monitoring (basic Vercel Analytics only)
- ❌ Alerting (not configured)
- ❌ Disaster recovery plan (not documented)

---

## Dependency Management

### Upgrade Policy
- **Node.js:** LTS versions only, upgrade within 3 months of LTS release
- **Next.js:** Upgrade to stable releases within 1 month
- **React:** Follow Next.js compatibility, typically same-day upgrade
- **Dependencies:** Weekly automated updates via Renovate (patch versions)
- **Security patches:** Immediate upgrade (within 24 hours)
- **Breaking changes:** Test thoroughly, update specs first

### Current Dependencies (package.json)

**Production:**
```json
{
  "@prisma/client": "5.6.0",
  "@sendgrid/mail": "7.7.0",
  "bcrypt": "5.1.1",
  "jose": "5.1.0",
  "next": "14.0.3",
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "react-hook-form": "7.48.2",
  "tailwindcss": "3.3.0",
  "zod": "3.22.4"
}
```

**Development:**
```json
{
  "@types/bcrypt": "5.0.2",
  "@types/node": "20.10.0",
  "@types/react": "18.2.42",
  "eslint": "8.54.0",
  "prettier": "3.1.0",
  "prisma": "5.6.0",
  "typescript": "5.3.2",
  "vitest": "1.0.4"
}
```

---

## Governance

### Spec-Driven Workflow (GitHub Spec Kit)

**All changes follow this process:**

1. **Specification First**
   - Update `.specify/memory/specifications/` BEFORE coding
   - Use `/speckit.specify` to create/update specs
   - Ensure acceptance criteria are clear

2. **Implementation Planning**
   - Create implementation plan with `/speckit.plan`
   - Review technical approach
   - Identify risks and dependencies

3. **Task Generation**
   - Use `/speckit.tasks` to break down plan
   - Review task list
   - Ensure tasks are atomic and testable

4. **Implementation**
   - Use `/speckit.implement` to execute tasks
   - Follow existing patterns and conventions
   - Write tests alongside code

5. **Validation**
   - Run `/speckit.analyze` to verify implementation matches spec
   - Run test suite
   - Manual testing of user flows

6. **Update Status**
   - Spec Kit automatically updates status markers
   - Update any related documentation
   - Commit with spec reference

### Code Review Process
- All PRs require review (1 approval minimum)
- Automated checks must pass (lint, typecheck, tests)
- Deployment preview must be validated
- Security-sensitive changes require additional review

### Deployment Process
- **Staging:** Automatic deployment from `main` branch
- **Production:** Manual promotion from staging
- **Rollback:** Revert to previous deployment within 5 minutes
- **Monitoring:** Watch error rates for 1 hour post-deploy

---

## Success Metrics

### Business KPIs
- User registration rate
- Daily active users (DAU)
- User retention (30-day: target 60%)
- Feature adoption rates
- Customer support tickets (target: < 10/week)

### Technical KPIs
- **Uptime:** 99.9% (current: measured via Vercel)
- **P95 API latency:** < 500ms (current: ~300ms ✅)
- **Error rate:** < 0.1% (current: not measured, need Sentry)
- **Test coverage:** 80%+ (current: 30% ❌)
- **Build time:** < 5 minutes (current: ~2min ✅)
- **Deployment frequency:** Daily (current: ~3x/week)

---

## Migration & Modernization

### Current State vs Ideal
[Document gaps between current implementation and ideal state]

**High Priority Improvements:**
1. Add integration and E2E tests (current: 0%)
2. Implement rate limiting (current: none)
3. Add error tracking (current: none)
4. Improve security headers (current: basic)

**Medium Priority:**
1. Add offline PWA support
2. Implement real-time updates (WebSocket)
3. Add caching layer (Redis)
4. Optimize database queries

**Low Priority:**
1. Dark mode support
2. Mobile native apps
3. Advanced analytics dashboard

### Upgrade Roadmap
[How to handle framework/dependency upgrades using Spec Kit]

**Example workflow:**
1. Update constitution: Change Next.js 14.0.3 → 15.0.0
2. Run `/speckit.analyze` → Shows gap (code is 14, spec requires 15)
3. Create implementation plan for upgrade
4. Use `/speckit.implement upgrade-nextjs` to execute
5. Validate with `/speckit.analyze` → Shows ✅ aligned

---

## Technical Constraints

### Must Maintain
[Technologies that cannot be changed without major rewrite]

- **Next.js:** Core to architecture, cannot change without full rewrite
- **PostgreSQL:** Data model designed for relational DB
- **Vercel:** Deployment pipeline and infrastructure integrated
- **Prisma:** Database access layer, schema migrations

### Can Upgrade
[Technologies that can be upgraded in-place]

- **Next.js:** Can upgrade major versions (with migration work)
- **React:** Can upgrade following Next.js compatibility
- **Node.js:** Can upgrade to newer LTS versions
- **Dependencies:** Can upgrade most without breaking changes

### Can Replace
[Technologies that can be swapped without major impact]

- **SendGrid:** Can switch to different email provider (interface abstracted)
- **Vercel Blob:** Can switch to S3, Cloudflare R2, etc.
- **Tailwind:** Could migrate to CSS-in-JS (major effort but possible)
- **shadcn/ui:** Could switch to different component library

---

## File Organization

### Project Structure
```
project-root/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth route group
│   │   ├── login/            # Login page
│   │   └── register/         # Register page
│   ├── api/                   # API routes
│   │   ├── auth/             # Auth endpoints
│   │   ├── users/            # User endpoints
│   │   └── fish/             # Fish endpoints
│   ├── dashboard/             # Dashboard page
│   └── layout.tsx            # Root layout
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── features/              # Feature-specific components
├── lib/
│   ├── auth/                  # Auth utilities (jwt, password)
│   ├── db/                    # Database utilities
│   ├── email/                 # Email utilities
│   └── validation/            # Zod schemas
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration history
│   └── seed.ts               # Seed data
├── public/                    # Static assets
├── .env.local                 # Local environment variables
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

### Naming Conventions
- **Files:** kebab-case (user-profile.tsx)
- **Components:** PascalCase (UserProfile)
- **Functions:** camelCase (getUserProfile)
- **Constants:** UPPER_SNAKE_CASE (MAX_FILE_SIZE)
- **Types/Interfaces:** PascalCase (UserProfile)
- **Database models:** PascalCase (User, Fish, Tank)
- **Database fields:** camelCase (emailVerified, createdAt)

---

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."              # Prisma connection string

# Authentication
JWT_SECRET="..."                             # Secret for signing JWTs (min 32 chars)
JWT_EXPIRY="24h"                            # Token expiration (optional, default: 24h)

# External Services
SENDGRID_API_KEY="SG...."                   # SendGrid API key
SENDGRID_FROM_EMAIL="noreply@example.com"   # Verified sender email
BLOB_READ_WRITE_TOKEN="..."                 # Vercel Blob storage token

# Application
NEXT_PUBLIC_APP_URL="https://example.com"   # Public-facing URL
NODE_ENV="production"                        # Environment (development|production)
```

### Optional Environment Variables
```bash
# Feature Flags
FEATURE_OFFLINE_MODE="false"                # Enable offline mode
FEATURE_ANALYTICS="true"                     # Enable analytics dashboard

# Monitoring
SENTRY_DSN="..."                            # Sentry error tracking (not configured)
```

---

## Quality Standards

### Code Quality Requirements
- ✅ ESLint passing (no warnings)
- ✅ TypeScript strict mode (no errors)
- ✅ Prettier formatting enforced
- ✅ No console.log in production code
- ⚠️ Code review for all changes (not enforced pre-commit)

### Testing Requirements (Current vs Target)
- **Unit Tests:** Current 30%, Target 80%
- **Integration Tests:** Current 0%, Target 80% (API routes)
- **E2E Tests:** Current 0%, Target 100% (critical flows)
- **Component Tests:** Current 0%, Target 60%

**Test Framework Setup:**
- ✅ Vitest configured for unit tests
- ❌ Playwright/Cypress not configured (need for E2E)
- ❌ Testing Library not configured (need for components)

### Security Standards (Current State)
- ✅ Input validation (Zod on all user inputs)
- ✅ Password hashing (bcrypt cost 10)
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ XSS prevention (React escapes by default)
- ⚠️ Rate limiting (MISSING - HIGH PRIORITY)
- ⚠️ CSRF protection (basic, needs improvement)
- ⚠️ Security headers (basic, needs improvement)

**Required Additions:**
1. Add rate limiting (@upstash/ratelimit or similar)
2. Improve security headers (helmet.js or manual)
3. Add CSRF tokens for state-changing operations
4. Implement refresh token rotation

---

## Governance & Workflow

### Spec-Driven Development with GitHub Spec Kit

**All changes follow:**
```
/speckit.specify → /speckit.plan → /speckit.tasks → /speckit.implement → /speckit.analyze
```

1. Requirements change → Update spec first
2. Plan implementation → Technical approach
3. Generate tasks → Break down work
4. Implement → Build to spec
5. Validate → Ensure alignment

### Upgrade Management

**Example: Next.js 14 → 15 upgrade**

1. **Update Constitution:**
   ```markdown
   - Framework: Next.js 14.0.3 → 15.0.0
   - Rationale: React 19 support, improved performance
   ```

2. **Run `/speckit.analyze`:**
   ```
   ⚠️ Gap: Spec requires Next.js 15.0.0, code uses 14.0.3
   ```

3. **Create Plan:**
   ```bash
   > /speckit.plan upgrade-nextjs-15
   ```

4. **Implement:**
   ```bash
   > /speckit.tasks upgrade-nextjs-15
   > /speckit.implement upgrade-nextjs-15
   ```

5. **Validate:**
   ```bash
   > /speckit.analyze
   ✅ Aligned
   ```

### Breaking Changes
- Require migration plan
- Update all affected specs
- Coordinate with team
- Test thoroughly before merge

---

## Success Metrics

### Business KPIs
- User registration rate: Target 100/week
- 30-day retention: Target 60%
- Daily active users: Target 500
- User satisfaction: Target 4.5/5

### Technical KPIs
- **Uptime:** 99.9% (measured via Vercel)
- **API latency (p95):** < 500ms (current: ~300ms ✅)
- **Error rate:** < 0.1% (not measured yet)
- **Test coverage:** 80%+ (current: 30% ❌)
- **Build time:** < 5min (current: ~2min ✅)
- **Deployment time:** < 10min (current: ~5min ✅)

---

## Notes

This constitution documents the **exact current implementation** of the application. It serves as the technical foundation for GitHub Spec Kit's validation and implementation workflows.

**Maintenance:**
- Update when dependencies are upgraded
- Update when architecture changes
- Review quarterly for accuracy
- Keep synchronized with `.specify/memory/specifications/`

**Using with Spec Kit:**
- `/speckit.analyze` validates code matches this constitution
- Technical decisions documented here guide all implementations
- Upgrade paths are managed through spec updates

---

**Constitution Version:** 1.0.0
**Path:** Brownfield (Tech-Prescriptive)
**Last Updated:** {{CURRENT_DATE}}
**Status:** ⚠️ Reflects current state, includes known gaps
