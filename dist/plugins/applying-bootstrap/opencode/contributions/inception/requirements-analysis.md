---
target: requirements-analysis
plugin: applying-bootstrap
adds:
  produces:
    - applying-bootstrap-readiness-check
  required_sections:
    - "Bootstrap Readiness"
fragments:
  - anchor: after-step:6
    order: 200
---

## fragment: after-step:6

### Step 6b (applying-bootstrap): Bootstrap readiness assessment

Before completing requirements analysis, assess whether the project is ready
for automated bootstrap. Check:

1. **Product-Definition completeness** — `vision-document.md` and
   `technical-environment.md` must exist and declare at least one component
   with a named stack.
2. **GitHub CLI availability** — confirm `gh` is installed and authenticated
   (run `gh auth status`).
3. **Repository strategy signals** — note any mentions of team structure,
   deployment independence, or shared-code needs from the vision document that
   inform the multi-repo vs. monorepo decision.

Write `applying-bootstrap-readiness-check.md` under a `## Bootstrap Readiness`
heading summarizing:
- Components detected (name + stack)
- Recommended repo strategy (and why)
- Any blockers (missing prerequisites, unresolved open questions)

This artifact feeds the `applying-bootstrap-project-setup` stage that follows.
