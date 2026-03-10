# CLAUDE.md

This file provides guidance for AI assistants (e.g., Claude Code) working in this repository.

---

## Repository Overview

**Repository**: SubZeroc25/aaa
**Status**: Newly initialized — no language, framework, or build system has been chosen yet.

The only committed file is `.gitattributes`, which enforces LF line endings across all text files (`* text=auto`).

---

## Git Workflow

### Branch Naming

Feature branches follow the pattern:
```
claude/<short-description>-<session-id>
```

Example: `claude/add-claude-documentation-oKoBC`

### Commit Signing

All commits are signed automatically via SSH:
- Signing key: `/home/claude/.ssh/commit_signing_key.pub`
- GPG format: `ssh`
- `commit.gpgsign = true`

Never pass `--no-verify` or `--no-gpg-sign` to bypass signing.

### Standard Git Operations

```bash
# Push a branch (always use -u on first push)
git push -u origin <branch-name>

# Fetch a specific branch
git fetch origin <branch-name>

# Pull a specific branch
git pull origin <branch-name>
```

If a push fails due to a network error, retry up to 4 times with exponential back-off: 2 s → 4 s → 8 s → 16 s.

**Never push to `main`/`master` directly.** All changes go through feature branches.

---

## Development Conventions (to be adopted when the stack is chosen)

Because this repository has no source code yet, the conventions below are placeholders that should be updated once a language and framework are selected. Follow these principles in the meantime:

### Code Style
- Prefer clarity over cleverness.
- Keep functions small and focused on a single responsibility.
- Avoid over-engineering — add abstractions only when a pattern appears at least three times.

### File Organization
- Group files by feature/domain rather than by type where practical.
- Keep configuration files at the repository root.
- Store documentation alongside the code it describes.

### Comments
- Write comments for *why*, not *what* — the code explains what it does; comments explain the reasoning.
- Do not add docstrings or type annotations to code you did not change.

### Error Handling
- Validate only at system boundaries (user input, external APIs).
- Trust internal code and framework guarantees — do not add defensive checks for impossible states.

---

## Adding Project-Specific Content

When a stack is chosen, update this file with:

1. **Setup** — how to install dependencies and configure the environment.
2. **Build** — the command(s) to compile or bundle the project.
3. **Test** — the command(s) to run the test suite and any coverage requirements.
4. **Lint / Format** — tools and commands used to enforce code style.
5. **CI/CD** — pipeline location and what checks must pass before merging.
6. **Key Architecture Decisions** — high-level design choices an AI assistant should respect.

---

## Security

- Do not commit secrets, credentials, or API keys. Use environment variables or a secrets manager.
- Do not introduce OWASP Top 10 vulnerabilities (SQL injection, XSS, command injection, etc.).
- Do not skip commit hooks or signing (`--no-verify` is prohibited unless explicitly authorized).

---

## Working with Claude Code

- **Read before editing** — always read a file before modifying it.
- **Minimal changes** — only change what is necessary for the current task; do not refactor surrounding code.
- **No speculative features** — do not add functionality that was not explicitly requested.
- **Confirm before destructive actions** — deleting files/branches, force-pushing, or resetting hard requires explicit user approval.
- **One task at a time** — use `TodoWrite` to track progress and mark items complete immediately after finishing them.
