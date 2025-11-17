# Tasks: {{feature_name}}

**Feature:** {{feature_id}}
**Branch:** `{{branch_name}}`
**Estimated Effort:** {{total_effort}} hours
**Generated:** {{date}}

---

## Summary

{{feature_summary}}

**User Stories:**
{{#each user_stories}}
- **{{id}}**: {{title}} ({{task_count}} tasks)
{{/each}}

**MVP Scope:** {{mvp_scope}}

---

## Phase 1: Setup (Project Initialization)

**Goal:** Prepare development environment and create foundational file structure

{{#each setup_tasks}}
- [ ] T{{id}} {{#if parallelizable}}[P] {{/if}}{{description}} in {{file_path}}
{{/each}}

**Completion Criteria:**
{{#each setup_criteria}}
- ✅ {{this}}
{{/each}}

---

## Phase 2: Foundational (Core Infrastructure)

**Goal:** Build reusable components that ALL user stories depend on

{{#each foundational_components}}
### Component {{index}}: {{name}}

{{#each tasks}}
- [ ] T{{id}} {{#if parallelizable}}[P] {{/if}}{{description}} in {{file_path}}
{{/each}}

**Independent Test:** {{independent_test}}

{{/each}}

**Foundational Completion Criteria:**
{{#each foundational_criteria}}
- ✅ {{this}}
{{/each}}

---

{{#each user_stories}}
## Phase {{phase_number}}: User Story {{story_number}} - {{title}}

**Goal:** {{goal}}

**Priority:** {{priority}}

**User Story:**
> {{full_story}}

### Implementation Tasks

{{#each implementation_tasks}}
- [ ] T{{id}} [{{story_label}}] {{description}} in {{file_path}}
{{/each}}

### Testing Tasks

{{#each testing_tasks}}
- [ ] T{{id}} {{#if parallelizable}}[P] {{/if}}[{{story_label}}] {{description}} in {{file_path}}
{{/each}}

**{{story_label}} Acceptance Criteria:**
{{#each acceptance_criteria}}
- {{#if completed}}[x]{{else}}[ ]{{/if}} {{this}}
{{/each}}

**{{story_label}} Independent Test:**
```bash
{{independent_test_script}}
```

---

{{/each}}

## Phase {{polish_phase_number}}: Polish & Cross-Cutting Concerns

**Goal:** Documentation, final integration, and cleanup

### Documentation Tasks

{{#each documentation_tasks}}
- [ ] T{{id}} {{description}} in {{file_path}}
{{/each}}

### Final Integration Tasks

{{#each integration_tasks}}
- [ ] T{{id}} {{description}}
{{/each}}

### Cleanup Tasks

{{#each cleanup_tasks}}
- [ ] T{{id}} {{description}}
{{/each}}

**Polish Completion Criteria:**
{{#each polish_criteria}}
- ✅ {{this}}
{{/each}}

---

## Dependencies & Execution Strategy

### Sequential Dependencies

```
{{dependency_graph}}
```

### User Story Dependencies

{{#each story_dependencies}}
- **{{story_label}}** ({{title}}): {{dependencies_description}}
{{/each}}

### Parallel Execution Opportunities

**After Phase 2 completes, these can run in parallel:**

```bash
{{#each parallel_teams}}
# Team Member {{index}}: {{focus}}
git checkout -b {{branch_name}}
# Implement {{task_range}}
{{/each}}
```

### MVP Execution (Fastest Path to Value)

**MVP = {{mvp_description}}**

```
{{mvp_task_path}}
```

{{mvp_deliverable}}

### Incremental Delivery Strategy

{{#each sprints}}
{{index}}. **Sprint {{number}}** (Week {{week}}): {{focus}}
   - Deliverable: {{deliverable}}
   - Risk: {{risk_level}} ({{risk_description}})

{{/each}}

---

## Testing Strategy Summary

### Unit Tests
- **Target:** {{unit_test_coverage}}% coverage
- **Location:** `{{unit_test_location}}`
- **Count:** {{unit_test_count}}+ unit tests across {{component_count}} components
- **Focus:** {{unit_test_focus}}

### Integration Tests
- **Target:** {{integration_test_target}}
- **Location:** `{{integration_test_location}}`
- **Count:** {{integration_test_count}}+ integration tests
- **Focus:** {{integration_test_focus}}

### Security Tests
- **Target:** {{security_test_target}}
- **Focus:** {{security_test_focus}}
- **Count:** {{security_test_count}}+ security tests
- **Tools:** {{security_test_tools}}

### Performance Tests
- **Target:** {{performance_target}}
- **Fixture:** `{{performance_fixture}}`
- **Metrics:** {{performance_metrics}}

---

## Task Summary

**Total Tasks:** {{total_tasks}}
{{#each phase_summary}}
- {{phase_name}}: {{task_count}} tasks
{{/each}}

**Effort Breakdown:**
{{#each effort_breakdown}}
- {{phase_name}}: {{hours}} hours
{{/each}}

**Total Effort:** {{total_effort_range}} hours

**Parallelizable Tasks:** {{parallelizable_count}} tasks marked with [P]

**MVP Path:** {{mvp_task_list}} = ~{{mvp_hours}} hours

---

## Validation Checklist

Before marking feature complete:

- [ ] All {{total_tasks}} tasks checked off
- [ ] All {{user_story_count}} user stories independently tested and passing
- [ ] Test coverage ≥{{coverage_target}}% for new code
- [ ] No TypeScript compilation errors
- [ ] No linting warnings
- [ ] Performance {{performance_requirement}}
- [ ] Security audit clean (npm audit)
- [ ] Documentation updated ({{doc_files}})
- [ ] Manual testing on {{manual_test_count}}+ real projects successful
- [ ] Constitution alignment verified ({{constitution_requirements}})

---

**Tasks Status:** ✅ Ready for Execution
**Last Updated:** {{date}}
