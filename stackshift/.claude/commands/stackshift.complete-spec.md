---
description: Gear 5 - Resolve clarifications and complete specifications
---

# Gear 5: Complete Specifications

**IMPORTANT**: Behavior depends on `implementation_framework` from Gear 1.

## Step 0: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Framework: ${IMPL_FRAMEWORK:-speckit}"
```

---

## Path A: GitHub Spec Kit (implementation_framework: speckit)

**This uses codebase exploration to provide evidence-based clarifications.**

## Step 1: Resolve Clarifications

Use the Skill tool with skill="complete-spec".

**The skill will**:
- Find all `[NEEDS CLARIFICATION]` markers in specs
- Explore the codebase for code evidence
- Ask targeted questions with actual code examples
- Update specs with answers
- Show actual code contradictions (not guesses)
- Provide evidence from real implementations

---

## Path B: BMAD Method (implementation_framework: bmad)

### Skip This Gear

For BMAD projects, specification clarification happens through BMAD's interactive workflow.

**How BMAD handles clarifications:**
1. `*workflow-init` detects brownfield project with existing `docs/`
2. Analyst agent reviews docs and asks clarifying questions
3. PM agent refines requirements interactively
4. Architect agent resolves technical ambiguities

**Why skip**: StackShift generated comprehensive documentation in Gear 2. BMAD agents handle clarifications through their conversational workflow, which is better suited to real-time refinement.

**Proceed to**: Gear 6 for BMAD handoff.
