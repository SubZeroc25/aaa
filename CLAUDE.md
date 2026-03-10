# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working in this repository.

## Repository Status

This repository is in its initial state. Currently it contains only:

- `.gitattributes` — configures LF line-ending normalization for all text files
- `CLAUDE.md` — this file

There is no application code, dependencies, build system, or tests yet.

## Git Configuration

### Line Endings

All text files use LF line endings (`* text=auto` in `.gitattributes`). When creating new files, ensure they follow Unix-style LF endings.

### Branch Convention

Active development branches follow the pattern:

```
claude/<description>-<session-id>
```

Example: `claude/add-claude-documentation-CLxWt`

### Commit Messages

Use clear, descriptive commit messages in the imperative mood:

- "Add user authentication module"
- "Fix null pointer in order processing"
- "Update dependencies to latest versions"

Avoid vague messages like "fix bug" or "update stuff".

### Push Workflow

Always use `-u` to set the upstream on first push:

```bash
git push -u origin <branch-name>
```

## Working in This Repository

Since no project structure exists yet, the first contributor should:

1. Decide on a language and framework
2. Initialize the appropriate package/dependency manager (e.g., `npm init`, `cargo init`, `go mod init`)
3. Add a `README.md` describing the project purpose
4. Update this `CLAUDE.md` with project-specific conventions once the stack is chosen

## Guidance for AI Assistants

### When Adding Code

- Follow the conventions of whatever language/framework is chosen
- Keep the directory structure logical and consistent with community standards for the chosen stack
- Do not create files speculatively — only create what is needed
- Prefer editing existing files over creating new ones where possible
- Do not add comments for self-evident code

### When Making Changes

- Read files before editing them
- Make targeted, minimal changes — avoid refactoring unrelated code
- Do not add error handling, fallbacks, or validation for scenarios that cannot actually occur
- Do not introduce premature abstractions

### Security

- Never commit secrets, credentials, or API keys
- Never add `.env` files containing real credentials to version control
- Validate input at system boundaries (user input, external APIs) only

### Testing

- Once a test framework is established, run tests before committing
- Keep tests close to the code they test (co-location preferred over a separate top-level `tests/` directory, unless the chosen framework mandates otherwise)

## Updating This File

Update this `CLAUDE.md` whenever:

- A language or framework is chosen and initialized
- A build system or task runner is added
- Test conventions are established
- Linting or formatting tools are configured
- CI/CD pipelines are set up
- New architectural patterns or conventions are adopted

Keep this file accurate — outdated guidance is worse than no guidance.
