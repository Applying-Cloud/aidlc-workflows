---
name: applying-bootstrap-full
plugin: applying-bootstrap
depth: Standard
keywords:
  - bootstrap
  - project setup
  - multi-repo
  - workspace setup
description: Full project bootstrap — repos, workspace, steering, and onboarding
skeleton: off
runner: true
---

# applying-bootstrap-full scope

Standard depth for exercising the applying-bootstrap plugin's full project
setup flow. It runs the bootstrap stage during inception, producing the
complete multi-repo (or monorepo) infrastructure with steering distribution
and onboarding scripts.

## Why this scope

Projects that need the full bootstrap flow — repository creation, workspace
configuration, steering/skills distribution, and onboarding automation — use
this scope to ensure the bootstrap stage runs alongside the standard inception
stages. Smaller scopes (poc, bugfix) skip the bootstrap entirely since they
operate within existing infrastructure.

## Membership

Keyword triggers: `bootstrap`, `project setup`, `multi-repo`, `workspace setup`.
`applying-bootstrap-project-setup` executes when its stage membership includes
this scope; unrelated stages remain governed by their own scope lists.
