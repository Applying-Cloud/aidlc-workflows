#!/usr/bin/env bun
// tools/aidlc-bootstrap-verify.ts — Verify bootstrap prerequisites.
//
// Usage:  bun <harness-dir>/tools/aidlc-bootstrap-verify.ts [--project <dir>]
//
// Checks:
//   1. gh CLI installed and authenticated
//   2. git configured (user.name, user.email)
//   3. Product-Definition/ exists with required documents
//
// Exits 0 with JSON summary on success, 1 with failure details.

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectDir = (() => {
  const idx = process.argv.indexOf("--project");
  if (idx !== -1 && process.argv[idx + 1]) return resolve(process.argv[idx + 1]);
  return process.cwd();
})();

interface Check {
  name: string;
  passed: boolean;
  detail: string;
}

const checks: Check[] = [];

// 1. gh installed
const ghVersion = spawnSync("gh", ["--version"], { encoding: "utf-8", shell: true });
checks.push({
  name: "gh-installed",
  passed: ghVersion.status === 0,
  detail: ghVersion.status === 0
    ? ghVersion.stdout.trim().split("\n")[0]
    : "gh CLI not found. Install from https://cli.github.com",
});

// 2. gh authenticated
const ghAuth = spawnSync("gh", ["auth", "status"], { encoding: "utf-8", shell: true });
checks.push({
  name: "gh-authenticated",
  passed: ghAuth.status === 0,
  detail: ghAuth.status === 0
    ? "authenticated"
    : "Not authenticated. Run: gh auth login",
});

// 3. git user.name
const gitName = spawnSync("git", ["config", "user.name"], { encoding: "utf-8", shell: true });
checks.push({
  name: "git-user-name",
  passed: gitName.status === 0 && gitName.stdout.trim().length > 0,
  detail: gitName.status === 0 ? gitName.stdout.trim() : "Not set. Run: git config --global user.name 'Your Name'",
});

// 4. git user.email
const gitEmail = spawnSync("git", ["config", "user.email"], { encoding: "utf-8", shell: true });
checks.push({
  name: "git-user-email",
  passed: gitEmail.status === 0 && gitEmail.stdout.trim().length > 0,
  detail: gitEmail.status === 0 ? gitEmail.stdout.trim() : "Not set. Run: git config --global user.email 'you@example.com'",
});

// 5. Product-Definition exists
const pdDir = join(projectDir, "Product-Definition");
const hasVision = existsSync(join(pdDir, "vision-document.md"));
const hasTechEnv = existsSync(join(pdDir, "technical-environment.md"));
checks.push({
  name: "product-definition",
  passed: hasVision && hasTechEnv,
  detail: hasVision && hasTechEnv
    ? "Product-Definition/ complete"
    : `Missing: ${!hasVision ? "vision-document.md " : ""}${!hasTechEnv ? "technical-environment.md" : ""}`.trim(),
});

// Output
const allPassed = checks.every((c) => c.passed);
const result = { ok: allPassed, checks };

console.log(JSON.stringify(result, null, 2));
process.exit(allPassed ? 0 : 1);
