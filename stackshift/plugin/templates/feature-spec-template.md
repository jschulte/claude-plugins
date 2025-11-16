# Feature: [Feature Name]

**Feature ID:** F0XX
**Status:** [✅ COMPLETE | ⚠️ PARTIAL | ❌ NOT IMPLEMENTED]
**Priority:** [P0 - Critical | P1 - High | P2 - Medium | P3 - Low]
**Backend:** [✅ Complete | ⚠️ Partial | ❌ Missing] ([X]%)
**Frontend:** [✅ Complete | ⚠️ Partial | ❌ Missing] ([X]%)

---

## User Story

As a [user type],
I want [capability],
So that [benefit].

---

## Acceptance Criteria

- [ ] [Criterion 1 - specific, testable]
- [ ] [Criterion 2 - specific, testable]
- [ ] [Criterion 3 - specific, testable]
- [ ] [More criteria as needed]

---

## Implementation Status

### ✅ IMPLEMENTED

**Backend:**
- [x] API endpoint: `[METHOD] /path` - [Description]
- [x] Data model: `[ModelName]` - [Description]
- [x] Business logic: `[ServiceName]` - [Description]
- [x] Input validation: [Validation approach]
- [x] Tests: [X]% coverage

**Frontend:**
- [x] Page: `/route` - [Purpose]
- [x] Component: `ComponentName` - [Purpose]
- [x] State management: [How handled]
- [x] API integration: [How connected]
- [x] Tests: [X]% coverage

**Infrastructure:**
- [x] [Any infrastructure components]

### ❌ NOT IMPLEMENTED

**Backend:**
- [ ] [Missing API endpoint or service]
- [ ] [Missing business logic]
- [ ] [Missing validation]

**Frontend:**
- [ ] [Missing page or route]
- [ ] [Missing component]
- [ ] [Missing state handling]
- [ ] [Missing UI element]

**Tests:**
- [ ] [Missing test coverage]

### [NEEDS CLARIFICATION]

- [?] [Question about requirement - how should X work?]
- [?] [Question about UX - should users see Y or Z?]
- [?] [Question about business rule - what happens when...?]

---

## Technical Details

### Data Models

**Primary Entities:**
```typescript
interface [EntityName] {
  field1: type;      // Description, constraints
  field2: type;      // Description, constraints
  // ...
}
```

**Relationships:**
- [Entity A] → [Entity B]: [Type of relationship]

### API Endpoints

#### `[METHOD] /path`

**Request:**
```json
{
  "field1": "value",
  "field2": 123
}
```

**Response (Success):**
```json
{
  "status": "success",
  "data": { ... }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Error description"
}
```

**Authentication:** [Required/Not Required]
**Authorization:** [Requirements]

### UI Components

**Component: `ComponentName`**
- **Location:** `path/to/component`
- **Props:** `{ prop1: type, prop2: type }`
- **State:** [Local state or global]
- **Behavior:** [How it works]

**Page: `/route`**
- **Layout:** [Description]
- **Components used:** [List]
- **User actions:** [What users can do]

### Business Rules

1. **[Rule Name]:** [Description]
   - Condition: [When this applies]
   - Behavior: [What happens]
   - Validation: [How validated]

2. **[Another Rule]:** [Description]

### Validation Rules

- `field1`: [Validation requirements]
- `field2`: [Validation requirements]

### Error Handling

- **[Error Case]:** [How handled, message shown]
- **[Another Error]:** [How handled]

---

## Dependencies

### Depends On
- [F0XX - Other Feature]: [Why/How]

### Depended On By
- [F0XX - Other Feature]: [Why/How]

### External Dependencies
- [External Service/API]: [Purpose]
- [Third-party Library]: [Purpose]

---

## Testing Requirements

### Unit Tests

**Backend:**
- Test [function/service]: [What to verify]
- Test [validation]: [What to verify]

**Frontend:**
- Test [component]: [User interactions to verify]
- Test [utility]: [Functionality to verify]

### Integration Tests

- Test [workflow]: [End-to-end scenario]
- Test [API integration]: [Request/response verification]

### E2E Tests

**User Workflow:**
1. User does [action]
2. System responds with [result]
3. User sees [feedback]
4. Verify [final state]

### Manual Testing Checklist

- [ ] [Test case 1]
- [ ] [Test case 2]
- [ ] [Edge case 1]
- [ ] [Edge case 2]

---

## Design/UX Notes

### User Flow

```
[Screen 1] → [Action] → [Screen 2] → [Action] → [Result]
```

### Wireframes/Mockups

[Link to designs or describe layout]

### Interaction Patterns

- **Hover:** [Behavior]
- **Click:** [Behavior]
- **Mobile:** [Touch gestures]

### Accessibility

- Keyboard navigation: [How supported]
- Screen reader: [ARIA labels used]
- Color contrast: [WCAG level met]

---

## Performance Requirements

- Page load: [Target time]
- API response: [Target time]
- Rendering: [Target time]
- Bundle size impact: [Acceptable increase]

---

## Security Considerations

- Authentication: [How handled]
- Authorization: [Who can access]
- Input sanitization: [What's validated]
- Data privacy: [How protected]

---

## Rollout Plan

- [ ] Phase 1: [Initial rollout scope]
- [ ] Phase 2: [Extended rollout]
- [ ] Monitoring: [What to watch]
- [ ] Rollback plan: [How to revert]

---

## Success Metrics

**How we'll measure success:**
- [Metric 1]: [Target value]
- [Metric 2]: [Target value]
- [User satisfaction]: [How measured]

---

## Notes

[Any additional context, decisions made, future enhancements, etc.]

---

**Last Updated:** [Date]
**Updated By:** [Person/Process]
**Version:** [Spec version if applicable]
