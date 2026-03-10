# Generate Iris Component Mapping

**Operation:** Map every legacy UI component to its Iris design system equivalent.

**Requirement:** 100% of components accounted for -- either mapped to Iris or flagged as "custom component needed."

---

## Step 1: Extract Legacy UI Components

**Source:** Component dependency tree from cms-web-widget-analyzer output (Phase 3).

For V9 Velocity widgets, the analyzer produces a full component tree:
```
widget.vm
  -> assembler.vm
    -> vcard/default/v1/component.vm
      -> ui/icon/v1/component.vm
      -> ui/button/v1/component.vm
      -> photo/default/v1/component.vm
      -> ui/state/v1/component.vm
      -> [more nested components]
```

For Osiris widgets, extract from:
- React/Angular component imports
- Shared component library usage
- Custom component definitions

**For each component, document:**
- Component path/name
- Purpose (what it renders)
- Props/inputs it accepts
- Nesting level
- Approximate complexity (simple/medium/complex)

---

## Step 2: Map to Iris Components

### Known Component Mapping Table

| Legacy Component | Iris Component(s) | Import | Notes |
|-----------------|-------------------|--------|-------|
| `ui/button/v1` | `@iris/Button` | `import { Button } from '@iris/button'` | Direct mapping |
| `ui/icon/v1` | `@iris/Icon` | `import { Icon } from '@iris/icon'` | Map icon names to Iris icon set |
| `ui/link/v1` | `@iris/Link` | `import { Link } from '@iris/link'` | Direct mapping |
| `vcard/default/v1` | `@iris/Card` (composed) | `import { Card } from '@iris/card'` | Composed from Card + Stack + children |
| `photo/default/v1` | `@iris/Avatar` or `@iris/Image` | `import { Avatar } from '@iris/avatar'` | Avatar for people, Image for general |
| `ui/state/v1` | `@iris/Badge` or `@iris/Chip` | `import { Badge } from '@iris/badge'` | For status indicators |
| Form text input | `@iris/TextField` | `import { TextField } from '@iris/text-field'` | For text inputs |
| Form select | `@iris/Select` | `import { Select } from '@iris/select'` | For dropdown selections |
| Form checkbox | `@iris/Checkbox` | `import { Checkbox } from '@iris/checkbox'` | For boolean toggles |
| Form radio | `@iris/RadioGroup` | `import { RadioGroup } from '@iris/radio-group'` | For single-select options |
| List/repeater | `@iris/List` + `@iris/ListItem` | `import { List, ListItem } from '@iris/list'` | For repeated items |
| Tab container | `@iris/Tabs` | `import { Tabs } from '@iris/tabs'` | For tabbed content |
| Modal/dialog | `@iris/Dialog` | `import { Dialog } from '@iris/dialog'` | For overlays |
| Tooltip | `@iris/Tooltip` | `import { Tooltip } from '@iris/tooltip'` | For hover info |
| Accordion | `@iris/Accordion` | `import { Accordion } from '@iris/accordion'` | For collapsible sections |

### Layout Components

| Legacy Pattern | Iris Component(s) | Usage |
|---------------|-------------------|-------|
| Vertical stack / column layout | `@iris/Stack` with `direction="column"` | Default vertical arrangement |
| Horizontal row / inline layout | `@iris/Stack` with `direction="row"` | Horizontal arrangement |
| Grid layout | `@iris/Grid` | Multi-column responsive layouts |
| Container/wrapper | `@iris/Container` | Max-width content wrapper |
| Divider/separator | `@iris/Divider` | Visual separation between sections |

### No Direct Equivalent

When a legacy component has no direct Iris match:

```
Flag: "Custom component needed"
Recommendation: Build using Iris primitives

Example:
  Legacy: custom-map-widget/v1
  Iris equivalent: None (no map component)
  Recommendation: Build MapView using @iris/Card as container,
    third-party map library for rendering,
    @iris/Button for controls
  Primitives needed: Card, Button, Stack
```

---

## Step 3: Map Styling

### CSS Class Preferences -> Design Tokens

| Legacy Pattern | Iris Approach | Example |
|---------------|--------------|---------|
| CSS class override preference | Iris `sx` prop with design tokens | `sx={{ color: 'text.primary' }}` |
| Inline style from preference | Iris `sx` prop | `sx={{ padding: 2 }}` |
| Size preference (small/medium/large) | Iris `size` prop | `size="md"` |
| Color preference | Iris semantic color token | `color="primary"` |
| Spacing preference | Iris spacing token | `spacing={2}` |
| Font preference | Iris typography token | `variant="body1"` |

### Theme Integration

```typescript
// Legacy: CSS class preferences control styling
// Iris: Theme tokens + sx prop

// Example transformation:
// Legacy: $vCardCssClass = "contact-card-dark"
// Iris:
<Card sx={{ bgcolor: 'background.paper' }} variant="outlined">
  {/* Content */}
</Card>
```

---

## Step 4: Compose Complex Components

**Decompose deeply nested legacy components into Iris component trees.**

### Composition Pattern

Show how 5-7 level legacy nesting maps to Iris composition:

```
Legacy (5 levels deep):
  widget.vm
    -> assembler.vm
      -> vcard/default/v1
        -> ui/icon/v1
        -> ui/button/v1

Iris (flat composition):
  <ContactInfo>              // Top-level (replaces widget.vm + assembler)
    <Card>                   // replaces vcard/default/v1
      <Stack spacing={2}>
        <ContactHeader>      // custom: name + photo section
          <Avatar />         // replaces photo/default/v1
          <Typography />     // name display
        </ContactHeader>
        <ContactDetails>     // custom: address + phone section
          <Stack>
            <Icon />         // replaces ui/icon/v1 (address)
            <Typography />   // address text
          </Stack>
          <Button />         // replaces ui/button/v1 (directions)
        </ContactDetails>
        <PhoneList>          // custom: phone numbers section
          {phones.map(phone => (
            <Stack direction="row">
              <Icon />       // phone icon
              <Link />       // phone number (if links enabled)
            </Stack>
          ))}
        </PhoneList>
      </Stack>
    </Card>
  </ContactInfo>
```

### Component Decomposition Guidelines

1. **Flatten nesting** - Iris components compose flat, not deeply nested
2. **Extract sections** - Each major section becomes a sub-component
3. **Use Stack for layout** - Replace structural `<div>` nesting with `<Stack>`
4. **Preserve business logic boundaries** - Each business rule gets its own component boundary
5. **Map conditional rendering** - Legacy `#if` blocks become conditional JSX

---

## Output Format

Write to `{output_dir}/iris-component-mapping.md` (output directory is determined by SKILL.md Step 7):

```markdown
---
widget: "v9.widgets.contact.info.v1"
total_legacy_components: 7
total_iris_components: 12
custom_components_needed: 3
extraction_date: "<date>"
---

# Iris Component Mapping

> Maps every legacy UI component to Iris design system equivalents.
> 100% coverage: every component accounted for.

## Summary

| Metric | Count |
|--------|-------|
| Legacy components analyzed | 7 |
| Direct Iris mappings | 4 |
| Composed Iris mappings | 2 |
| Custom components needed | 3 |
| Iris primitives used | 12 |

## Component Mapping Table

| ID | Legacy Component | Iris Component(s) | Composition Pattern | Props Mapped | Custom Work |
|----|-----------------|-------------------|--------------------|--------------| ------------|
| COMP-001 | vcard/default/v1 | Card + Stack | Card wraps Stack of sections | variant, elevation | Section decomposition |
| COMP-002 | ui/icon/v1 | Icon | Direct | name, size, color | Map icon names |
| COMP-003 | ui/button/v1 | Button | Direct | variant, size, onClick | None |
| COMP-004 | photo/default/v1 | Avatar | Direct | src, alt, size | None |
| COMP-005 | ui/state/v1 | Badge | Direct | color, variant | None |
| COMP-006 | phone-list (implicit) | List + ListItem | Composed | items, renderItem | Custom PhoneList component |
| COMP-007 | address-section (implicit) | Stack | Composed | direction, spacing | Custom AddressSection component |

## Iris Component Tree

```
<ContactInfo>                          [custom - top-level orchestrator]
  <Card variant="outlined">            [COMP-001: vcard/default/v1]
    <Stack spacing={2}>
      <Stack direction="row">          [header section]
        <Avatar />                     [COMP-004: photo/default/v1]
        <Typography variant="h6" />    [name]
      </Stack>
      <Divider />
      <AddressSection>                 [COMP-007: custom]
        <Stack direction="row">
          <Icon name="location" />     [COMP-002: ui/icon/v1]
          <Typography />              [address text]
        </Stack>
        <Button variant="outlined">   [COMP-003: ui/button/v1]
          Get Directions
        </Button>
      </AddressSection>
      <PhoneList>                      [COMP-006: custom]
        {phones.map(phone => (
          <ListItem>
            <Icon name="phone" />      [COMP-002]
            <Link href={`tel:${phone.number}`}>
              {phone.formatted}
            </Link>
          </ListItem>
        ))}
      </PhoneList>
      <Badge color="success">         [COMP-005: ui/state/v1]
        {status}
      </Badge>
    </Stack>
  </Card>
</ContactInfo>
```

## Custom Components Needed

### 1. ContactInfo (top-level)
**Purpose:** Orchestrates data fetching, preference application, and renders Card
**Iris primitives:** Card, Stack
**Business logic:** Account selection, preference cascade, conditional sections
**Props:** See preference-catalog.md React Component Props Interface

### 2. PhoneList
**Purpose:** Renders ordered list of department phone numbers
**Iris primitives:** List, ListItem, Icon, Link, Typography
**Business logic:** Phone ordering, click-to-call toggle, department defaults
**Props:** phones, asLinks, maxNumbers

### 3. AddressSection
**Purpose:** Renders address with optional directions button
**Iris primitives:** Stack, Icon, Typography, Button
**Business logic:** Address formatting, directions button feature flag
**Props:** address, showDirections, onGetDirections

## Icon Mapping

| Legacy Icon | Iris Icon Name | Usage |
|-------------|---------------|-------|
| address-icon | `location_on` | Address section |
| phone-icon | `phone` | Phone numbers |
| email-icon | `email` | Email section |
| hours-icon | `schedule` | Hours section |
| social-icon | `share` | Social links |
| directions-icon | `directions` | Directions button |

## Verification

- Legacy components in dependency tree: {N}
- Components with Iris mapping: {N}
- Coverage: 100%
- Components needing custom work: {N} (all using Iris primitives)
```
