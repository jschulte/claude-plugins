# StackShift Agents

Custom AI agents for StackShift tasks. These agents are included with the plugin so users don't need external dependencies.

## Available Agents

### stackshift:technical-writer
**Purpose:** Generate technical documentation and specifications

**Use cases:**
- Creating feature specifications in specs/
- Writing constitution.md
- Generating implementation plans
- Creating comprehensive documentation

**Specialization:**
- Clear, concise technical writing
- Markdown formatting
- GitHub Spec Kit format compliance
- Acceptance criteria definition
- Implementation status tracking

### stackshift:code-analyzer
**Purpose:** Deep codebase analysis and extraction

**Use cases:**
- Extracting API endpoints from code
- Identifying data models and schemas
- Mapping component structure
- Detecting configuration options
- Assessing completeness

**Specialization:**
- Multi-language code analysis
- Pattern recognition
- Dependency detection
- Architecture identification

## How They Work

StackShift agents are automatically available when the plugin is installed. Skills can invoke them for specific tasks:

```typescript
// In a skill
Task({
  subagent_type: 'stackshift:technical-writer',
  prompt: 'Generate feature specification for user authentication...'
})
```

## Benefits

✅ Self-contained - No external dependencies
✅ Optimized - Tuned for StackShift workflows
✅ Consistent - Same output format every time
✅ Reliable - Don't break if user doesn't have other plugins

## Agent Definitions

Each agent has:
- `AGENT.md` - Agent definition and instructions
- Specific tools and capabilities
- Guidelines for output format
- Examples of usage

These follow Claude Code's agent specification format.
