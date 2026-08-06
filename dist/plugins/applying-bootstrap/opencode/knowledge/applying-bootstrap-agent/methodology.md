# Applying Bootstrap Methodology

## Multi-Repo Workspace Strategy

The default recommendation for Applying projects is **multi-repo en workspace**:
one repo per component (frontend, backend, infra), grouped under a VS Code /
Kiro IDE workspace file. This gives:

- Independent CI/CD per component
- Clear ownership boundaries
- Shared context via the config repo's steering files
- IDE workspace aggregation for the developer experience

### When to deviate

- **Monorepo**: Team ≤ 3 people, everyone touches everything, single deployment unit.
- **Multi-repo independent**: Fully autonomous teams, no shared types/contracts.

## Steering Distribution Model

Steering files come from [`applying-steering-templates`](https://github.com/Applying-Cloud/applying-steering-templates) (a separate repo):

1. Clone the templates repo at a pinned version (tag or commit hash).
2. Read `catalog.md` — each entry has an "aplica cuando" (applies when) criterion.
3. Match criteria against `Product-Definition/technical-environment.md`.
4. Present selection per component for user approval.
5. Copy approved steering to each component's `.kiro/steering/`.
6. Record version and selection in the audit artifact.

## Config Repo Convention

The repo where AI-DLC runs becomes the config repo:
- Holds `Product-Definition/`, the workspace file, api-contracts, shared-types
- Never creates a separate config repo — structures THIS one in place
- `.kiro/` and `aidlc/` are pre-existing (from framework install) — never overwrite

## Workspace File Format

```json
{
  "folders": [
    { "path": "../{producto}-config", "name": "config" },
    { "path": "../{producto}-frontend", "name": "frontend" },
    { "path": "../{producto}-backend", "name": "backend" },
    { "path": "../{producto}-infra", "name": "infra" }
  ],
  "settings": {
    "kiro.steering.sharedPath": "../{producto}-config"
  }
}
```

Relative paths (`../`) ensure the workspace works regardless of where each
developer clones.

## Onboarding Script Contract

`scripts/setup.sh` must:
- Verify prerequisites (gh, git, auth)
- Clone all component repos at the correct branch
- Print a single command to open the workspace in the IDE
- Be idempotent (skip existing clones)

## product.md Distribution

`Product-Definition/vision-document.md` is copied as `product.md` to every
component's `.kiro/steering/` with `inclusion: always`. This ensures the agent
always knows the full product context regardless of which component it's
operating in.
