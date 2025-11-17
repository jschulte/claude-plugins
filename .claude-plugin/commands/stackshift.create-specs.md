---
description: Gear 3 - Generate GitHub Spec Kit specifications for ALL features
---

Run the create-specs skill to automatically generate comprehensive specifications.

This is **Gear 3** of the StackShift process.

Execute: `/skill create-specs`

This will:
- Automatically parse functional-specification.md
- Extract ALL features (complete, partial, missing)
- Generate constitution.md
- Create specs for EVERY feature (not just gaps!)
- Create implementation plans for incomplete features
- Set up /speckit.* slash commands
- Achieve 100% spec coverage

Prerequisites: Complete Gear 2 (reverse-engineer)

**Critical**: Creates specs for existing features too, enabling spec-driven changes to current code!
