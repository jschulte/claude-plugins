# Scan Integration Signals

Detailed instructions for scanning a repository for integration signals across 10 categories.

---

## Overview

Run all 10 signal scanners on a repository to extract names of related services, packages, databases, and infrastructure. Each scanner extracts a list of **signal entries** with:

- **name**: The service/package/resource name
- **category**: Which of the 10 signal categories
- **source_file**: Where the signal was found
- **raw_value**: The raw text that was matched
- **direction**: `outbound` (this repo calls it) or `inbound` (it calls this repo) or `shared` (shared resource)

---

## Signal 1: Scoped npm Packages

Scan `package.json` for org-scoped packages that indicate shared internal libraries.

```bash
# Read package.json dependencies
cat package.json 2>/dev/null | jq -r '
  (.dependencies // {} | keys[]) ,
  (.devDependencies // {} | keys[]) ,
  (.peerDependencies // {} | keys[])
' 2>/dev/null | grep "^@" | sort -u
```

**What to extract:**
- Package names starting with `@org/` (where `org` matches the repo's GitHub org)
- The org scope itself (identifies the organization)
- Strip the scope to get the package name: `@myorg/shared-utils` → `shared-utils`

**Signal direction:** `outbound` (this repo depends on the package)

**Example output:**
```
@myorg/shared-utils → shared-utils (outbound, package.json)
@myorg/ui-components → ui-components (outbound, package.json)
@myorg/eslint-config → eslint-config (outbound, package.json)
```

---

## Signal 2: Docker Compose Services

Scan `docker-compose*.yml` files for service definitions and dependencies.

```bash
# Find all docker compose files
ls docker-compose*.yml docker-compose*.yaml compose.yml compose.yaml 2>/dev/null
```

**What to extract from each compose file:**
- Service names under the `services:` key
- `depends_on` references (strong dependency signal)
- `links` references (older Docker linking)
- Image names that suggest internal services (not standard images like `postgres`, `redis`)
- Network names (shared networks = shared infrastructure)
- Volume names with paths suggesting shared data

**Signal direction:**
- Services in `depends_on`: `outbound` (this repo depends on them)
- Other services defined alongside: `shared` (co-deployed)

**How to parse YAML without a parser:**
```bash
# Extract service names (top-level keys under services:)
grep -E "^  [a-zA-Z]" docker-compose.yml | sed 's/:.*//' | tr -d ' '

# Extract depends_on values
grep -A 20 "depends_on:" docker-compose.yml | grep -E "^\s+- " | sed 's/.*- //'

# Extract image names
grep "image:" docker-compose.yml | sed 's/.*image:\s*//'
```

**Filter out standard infrastructure images:**
- `postgres`, `postgresql`, `mysql`, `mariadb` → tag as `database` type, not a repo
- `redis`, `memcached` → tag as `cache` type
- `rabbitmq`, `kafka`, `zookeeper` → tag as `queue` type
- `elasticsearch`, `opensearch` → tag as `search` type
- `nginx`, `traefik`, `envoy` → tag as `proxy` type
- `prometheus`, `grafana`, `jaeger` → tag as `observability` type

**Example output:**
```
auth-service → auth-service (outbound, docker-compose.yml depends_on)
user-api → user-api (shared, docker-compose.yml service)
postgres → database (shared, docker-compose.yml image)
redis → cache (shared, docker-compose.yml image)
```

---

## Signal 3: Environment Variables

Scan `.env*` files and config files for references to other services.

```bash
# Find env files
ls .env .env.example .env.local .env.development .env.sample .env.template 2>/dev/null

# Find config files
ls config/*.yml config/*.yaml config/*.json src/config/*.ts src/config/*.js 2>/dev/null
```

**What to extract:**
- Variables ending in `_URL`, `_HOST`, `_ENDPOINT`, `_API`, `_SERVICE`, `_BASE_URL`
- Variables containing service names: `AUTH_SERVICE_URL`, `INVENTORY_API_HOST`
- Database connection strings: `DATABASE_URL`, `REDIS_URL`, `MONGODB_URI`
- Queue/message broker URLs: `RABBITMQ_URL`, `KAFKA_BROKERS`, `SQS_QUEUE_URL`

**Pattern matching:**
```bash
# Find service-related env vars
grep -hE "^[A-Z_]*(URL|HOST|ENDPOINT|API|SERVICE|BASE_URL|BROKER|QUEUE)\s*=" \
  .env* 2>/dev/null | sort -u

# Extract service name from variable name
# AUTH_SERVICE_URL → auth-service
# INVENTORY_API_HOST → inventory-api
# USER_DB_URL → user (database)
```

**Naming heuristics to extract service names:**
1. Remove suffix: `_URL`, `_HOST`, `_ENDPOINT`, `_API_URL`, `_BASE_URL`, `_SERVICE_URL`
2. Convert to lowercase and replace `_` with `-`: `AUTH_SERVICE` → `auth-service`
3. Filter out generic names: `APP`, `NODE`, `PORT`, `LOG`, `DEBUG`

**Signal direction:** `outbound` (this repo connects to the service)

**Example output:**
```
auth-service → auth-service (outbound, .env.example AUTH_SERVICE_URL)
inventory-api → inventory-api (outbound, .env.example INVENTORY_API_HOST)
postgres → database (outbound, .env.example DATABASE_URL)
```

---

## Signal 4: API Client Calls

Scan source code for HTTP client calls, gRPC imports, and API URL patterns.

```bash
# Search for HTTP client calls with service URLs
grep -rn "fetch\|axios\|http\.\|request(" src/ lib/ app/ --include="*.ts" --include="*.js" --include="*.py" --include="*.go" --include="*.java" 2>/dev/null | head -50

# Search for URL patterns pointing to other services
grep -rn "localhost:\|://.*-service\|://.*-api\|://.*\.internal" src/ lib/ app/ 2>/dev/null | head -50

# Search for gRPC proto imports
find . -name "*.proto" -exec grep "import\|package" {} \; 2>/dev/null

# Search for OpenAPI/Swagger client imports
grep -rn "openapi\|swagger\|api-client" src/ lib/ 2>/dev/null | head -30
```

**What to extract:**
- Service names from URL patterns: `http://auth-service:3000` → `auth-service`
- gRPC service names from `.proto` files
- Generated API client imports (often named after the service)
- Internal DNS patterns: `*.internal`, `*.svc.cluster.local`

**Signal direction:** `outbound` (this repo calls the service)

---

## Signal 5: Shared Databases

Scan for database connection strings and schema references that suggest shared data.

```bash
# Database connection strings
grep -rn "DATABASE_URL\|DB_HOST\|DB_NAME\|connectionString" . \
  --include="*.env*" --include="*.yml" --include="*.yaml" --include="*.json" --include="*.ts" --include="*.js" 2>/dev/null | head -20

# Prisma schema (database name)
cat prisma/schema.prisma 2>/dev/null | grep "url\|datasource"

# TypeORM/Sequelize config
grep -rn "database:\|dbName:" src/ config/ --include="*.ts" --include="*.js" 2>/dev/null | head -10

# SQL migration files (table names suggest domain)
ls -la migrations/ db/migrate/ prisma/migrations/ 2>/dev/null
```

**What to extract:**
- Database names from connection strings
- Schema names if using multi-schema PostgreSQL
- Table name prefixes that match other service names

**Signal direction:** `shared` (database is a shared resource)

---

## Signal 6: CI/CD Triggers

Scan GitHub Actions workflows for cross-repo triggers and dependencies.

```bash
# List workflow files
ls .github/workflows/*.yml .github/workflows/*.yaml 2>/dev/null

# Search for cross-repo triggers
grep -rn "repository_dispatch\|workflow_dispatch\|workflow_call\|workflow_run" .github/workflows/ 2>/dev/null

# Search for repo references in workflows
grep -rn "uses:.*/" .github/workflows/ 2>/dev/null | grep -v "actions/" | head -20

# Search for deployment triggers that reference other repos
grep -rn "repository:\|repo:" .github/workflows/ 2>/dev/null | head -10
```

**What to extract:**
- `repository_dispatch` events (cross-repo triggers)
- `workflow_call` from other repos (reusable workflows)
- Referenced repositories in `uses:` that aren't standard GitHub Actions
- Deployment targets that mention other services

**Signal direction:** varies (check trigger direction)

---

## Signal 7: Workspace Configs

Scan monorepo workspace configurations for package lists.

```bash
# pnpm workspace
cat pnpm-workspace.yaml 2>/dev/null

# Turbo.json
cat turbo.json 2>/dev/null

# Nx workspace
cat nx.json 2>/dev/null
cat workspace.json 2>/dev/null

# Lerna
cat lerna.json 2>/dev/null

# Yarn workspaces (in package.json)
cat package.json 2>/dev/null | jq '.workspaces' 2>/dev/null
```

**What to extract:**
- Package directory patterns: `packages/*`, `apps/*`, `services/*`
- Explicit package lists
- Actual directories matching workspace globs

**Resolve globs to actual packages:**
```bash
# For pnpm-workspace.yaml with "packages: ['packages/*', 'apps/*']"
ls -d packages/*/ apps/*/ 2>/dev/null
```

All packages found in workspace configs get **CONFIRMED** confidence.

**Signal direction:** `shared` (co-located in monorepo)

---

## Signal 8: Message Queues/Events

Scan for message broker references (SQS, SNS, Kafka, RabbitMQ, Redis pub/sub).

```bash
# Queue/topic names in source code
grep -rn "QueueUrl\|TopicArn\|topic:\|queue:\|channel:" src/ lib/ app/ \
  --include="*.ts" --include="*.js" --include="*.py" --include="*.go" 2>/dev/null | head -30

# SQS/SNS ARNs
grep -rn "arn:aws:sqs\|arn:aws:sns" . --include="*.ts" --include="*.js" --include="*.yml" --include="*.yaml" --include="*.tf" 2>/dev/null | head -20

# Kafka topic configurations
grep -rn "kafka.*topic\|KAFKA_TOPIC\|bootstrap.servers" . \
  --include="*.ts" --include="*.js" --include="*.py" --include="*.yml" --include="*.properties" 2>/dev/null | head -20

# RabbitMQ exchange/queue names
grep -rn "amqp://\|exchange:\|routing_key:" . \
  --include="*.ts" --include="*.js" --include="*.py" --include="*.yml" 2>/dev/null | head -20

# Event names (custom event buses)
grep -rn "EventBridge\|eventbus\|emit(\|publish(" src/ lib/ 2>/dev/null | head -20
```

**What to extract:**
- Queue/topic names: these are shared resources between producer and consumer
- The naming convention often includes the service name: `user-events`, `order-created`
- Extract the domain from queue/topic names

**Signal direction:** `shared` (queues connect producers and consumers)

---

## Signal 9: Infrastructure Refs

Scan infrastructure-as-code for shared resources.

```bash
# Terraform files
find . -name "*.tf" -exec grep -l "module\|data\|resource" {} \; 2>/dev/null

# Look for references to other services in Terraform
grep -rn "service\|cluster\|vpc\|subnet\|security_group\|alb\|target_group" \
  terraform/ infra/ infrastructure/ --include="*.tf" 2>/dev/null | head -30

# CloudFormation
find . -name "*.template" -o -name "*.cfn.yml" -o -name "*.cfn.yaml" 2>/dev/null

# Kubernetes manifests
find . -name "*.yaml" -path "*/k8s/*" -o -name "*.yaml" -path "*/kubernetes/*" 2>/dev/null

# Helm charts
find . -name "Chart.yaml" 2>/dev/null
ls helm/ charts/ 2>/dev/null
```

**What to extract:**
- Service names from Kubernetes Deployments/Services
- Shared VPC, subnet, and security group references
- ALB/NLB target groups (which services share a load balancer?)
- Terraform remote state references (cross-stack dependencies)
- Helm chart dependencies

**Signal direction:** `shared` (infrastructure is shared)

---

## Signal 10: Language-Specific Dependency Files

Scan language-specific dependency/module files for internal references.

### Go
```bash
# go.mod replace directives (local module references)
grep "replace" go.mod 2>/dev/null

# Internal package imports
grep -rn "github.com/${ORG}/" . --include="*.go" 2>/dev/null | head -20
```

### Python
```bash
# requirements.txt with git/local refs
grep -E "git\+|file:|^-e" requirements.txt 2>/dev/null

# pyproject.toml dependencies with git refs
grep -A 5 "dependencies" pyproject.toml 2>/dev/null | grep "git"

# Internal package imports
grep -rn "from ${org}" . --include="*.py" 2>/dev/null | head -20
```

### Java/Kotlin
```bash
# Maven parent/dependency references to internal artifacts
grep -A 2 "groupId" pom.xml 2>/dev/null | grep "${org_group_id}"

# Gradle internal dependencies
grep "implementation.*${org}" build.gradle build.gradle.kts 2>/dev/null
```

### Ruby
```bash
# Gemfile with git/path sources
grep -E "git:|path:" Gemfile 2>/dev/null
```

### .NET
```bash
# Project references
grep "ProjectReference\|PackageReference" *.csproj 2>/dev/null
```

**What to extract:**
- Internal package/module names
- Local path references (`replace ../shared`)
- Git repository references matching the org

**Signal direction:** `outbound` (this repo imports from them)

---

## Aggregating Results

After running all 10 scanners, compile a unified signal list:

```
Signal Summary for: user-service
═══════════════════════════════════

Discovered Names:
1. shared-utils        [npm-package, import-path] → 2 signals
2. auth-service        [docker-compose, env-var, api-call] → 3 signals
3. inventory-api       [env-var] → 1 signal
4. notification-hub    [api-call, message-queue] → 2 signals
5. redis              [docker-compose, env-var] → infrastructure
6. postgres           [docker-compose, env-var] → infrastructure
7. order-events       [message-queue] → queue/topic
8. shared-vpc         [infrastructure] → infrastructure

Service Names: shared-utils, auth-service, inventory-api, notification-hub
Infrastructure: redis, postgres
Queues/Topics: order-events
Shared Infra: shared-vpc
```

Pass this list to the merge-and-score step.
