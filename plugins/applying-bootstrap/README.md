# applying-bootstrap — AIDLC project bootstrapping plugin

> A first-party **AIDLC plugin**: automated project infrastructure creation
> (repos, workspace, steering distribution, onboarding) during inception.
> Design: [`docs/reference/18-plugin-mechanism.md`](../../docs/reference/18-plugin-mechanism.md).

## 1. What it does

applying-bootstrap automates the "project setup" ceremony that used to be a
manual checklist (the v1 `applying-project-bootstrap` extension). It:

- **detects components** from `Product-Definition/technical-environment.md`
  and presents them for confirmation;
- **guides repository strategy** selection (multi-repo workspace, monorepo,
  or multi-repo independent) with a recommendation based on the vision document;
- **creates GitHub repos** via `gh`, structures folders, and generates the
  IDE workspace file;
- **distributes steering and skills** from the [`applying-steering-templates`](https://github.com/Applying-Cloud/applying-steering-templates)
  catalog per component;
- **generates an onboarding script** (`scripts/setup.sh`) for new developers;
- **records every decision** in an audit artifact for traceability.

It ships its own `applying-bootstrap-agent` persona — a project infrastructure
specialist.

## 2. How to use it

**Author / build** (from the repo):
```bash
bun scripts/package.ts          # emits dist/plugins/applying-bootstrap/{claude,codex,kiro,kiro-ide}/
```

**Kiro IDE** (folder-drop + compose):
```bash
cp -r dist/plugins/applying-bootstrap/kiro-ide/. <project>/
# Then in chat:
/aidlc --doctor                 # expect the bootstrap stage in the graph
/aidlc --scope enterprise       # or any scope that includes the bootstrap stage
```

**Claude Code** (host store):
```
/plugin marketplace add <your-repo>/dist/plugins/applying-bootstrap/claude
/plugin install applying-bootstrap@aidlc-plugins
```

> **Scope gating.** The bootstrap stage activates under `enterprise`, `feature`,
> `mvp`, `workshop`, and `applying-bootstrap-full` scopes — a `poc`/`bugfix`
> run won't reach it.

## 3. Existing stages it modifies (the contribution seam)

| Core stage | What applying-bootstrap adds |
|---|---|
| **`requirements-analysis`** (inception) | Produces `applying-bootstrap-readiness-check`; required section **Bootstrap Readiness**. Assesses component detection, repo strategy signals, and prerequisite availability. |

## 4. New stages it creates

| Stage | Phase | # | Activation | Produces |
|---|---|---|---|---|
| **`applying-bootstrap-project-setup`** (Project Bootstrap Setup) | inception | 2.15 | scopes: enterprise, feature, mvp, workshop, applying-bootstrap-full; CONDITIONAL (runs when Product-Definition/ has vision-document + technical-environment) | 6 artifacts: component-matrix, repo-strategy, workspace-config, steering-selection, onboarding-script, audit-record |

Led by `applying-bootstrap-agent`, `mode: inline`.

## 5. Design & implementation

### Layout
```
plugins/applying-bootstrap/
  .aidlc-plugin/plugin.json                           # manifest
  stages/inception/applying-bootstrap-project-setup.md # the NEW stage
  contributions/inception/requirements-analysis.md     # the 1 stage MODIFICATION
  agents/applying-bootstrap-agent.md                   # the infrastructure specialist
  scopes/applying-bootstrap-full.md                    # plugin scope
  knowledge/applying-bootstrap-agent/methodology.md    # methodology knowledge
  tools/aidlc-bootstrap-verify.ts                      # prerequisite verification
  tests/plugin.test.ts                                 # content validation
  README.md
```

### Key principles
- **Gate every decision** — nothing executes without user approval
- **Non-destructive** — never overwrites existing `.kiro/`, `Product-Definition/`, or `aidlc/`
- **Idempotent** — re-running detects existing repos/structure and skips
- **Traceable** — records steering version, decisions, and timestamps

### Migration from v1

The v1 `applying-project-bootstrap` was a monolithic extension document
(`applying-project-bootstrap.md` + `applying-project-bootstrap-opt-in.md`).
In v2 it becomes a proper AIDLC plugin with:
- Structured stage frontmatter (slug, produces, consumes, requires_stage)
- Contribution seam integration with requirements-analysis
- Its own agent persona (instead of relying on the conductor)
- Proper scope gating (not all runs need bootstrapping)
- Plugin-namespaced artifacts (`applying-bootstrap-*`)
- A dedicated verification tool (`aidlc-bootstrap-verify.ts`)

### Testing this plugin
```bash
bun test plugins/applying-bootstrap/tests/plugin.test.ts
```

## See also
- [Plugin Mechanism](../../docs/reference/18-plugin-mechanism.md)
- [Authoring a Plugin](../../docs/harness-engineering/10-authoring-a-plugin.md)
