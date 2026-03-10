# Roadmap

## Shipped

These were previously on the roadmap and are now available:

- Ecosystem discovery (`/stackshift.discover`)
- Batch processing (`/stackshift.batch`)
- Multi-repo synthesis (`/stackshift.reimagine`)
- BMAD Auto-Pilot (`/stackshift.bmad-synthesize`)
- Architecture generation (`/stackshift.architect`)
- Incremental doc refresh (`/stackshift.refresh-docs`)
- Spec quality scoring (`/stackshift.quality`)
- Widget migration pipeline (`/stackshift.widget-migrate`)
- Integration analysis (`/stackshift.integration-analysis`)
- Portable component extraction (`/stackshift.portable-extract`)
- Spec coverage mapping (`/stackshift.coverage`)
- Spec diffing (`/stackshift.diff`)

## Planned

### StackSync: Specification Synchronization

Keep legacy and greenfield apps in sync during platform migrations. Compare `.specify/` between two repos, identify matching/divergent features, and sync changes interactively or automatically.

### Dual-Spec Mode

Generate both prescriptive and agnostic specs in one run. Useful for migration projects where you need specs for both the legacy app and the new one.

### Spec Drift Detection (CI/CD)

GitHub Action that alerts when code changes but specs don't, or when specs say COMPLETE but implementation is missing.

## Ideas

- VSCode extension with native UI
- Spec templates marketplace (reusable auth, payments, file upload specs)
- Linear/Jira integration (sync specs with tickets)
- Automatic code-to-spec updates (code changed -> AI updates spec -> creates PR)

---

Feature requests: [Open an issue](https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift/issues/new)
