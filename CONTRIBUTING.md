# Contributing Guidelines

## Code Standards

**Backend (Python)**
- PEP 8 style guide
- Max line length: 100 characters
- Use type hints
- No AI-generated comments
- Meaningful variable/function names

**Frontend (TypeScript/React)**
- Follow ESLint rules
- Use TypeScript (no `any` unless necessary)
- Max line length: 100 characters
- Functional components with hooks
- No AI-generated comments

## Git Workflow

**Branch Naming:**
- `feature/description`
- `fix/description`
- `hotfix/description`

**Commit Format:** `type: brief description`

Types: `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`

## Pull Request Requirements

**Before PR:**
- All tests pass
- Linters pass (no errors)
- Remove console.log statements
- Remove AI-generated comments
- Test locally (backend + frontend)

**PR Must Include:**
- Clear title (follow commit format)
- Description of changes
- Screenshots for UI changes
- Reference related issues

**Code Review:**
- Minimum one approval required
- Address all review comments
- No force pushes after review

## Prohibited

- ❌ Committing `.env` files or API keys
- ❌ Using `any` type (unless necessary)
- ❌ Leaving console.log statements
- ❌ AI-generated verbose comments
- ❌ Force pushing to main/master
- ❌ Merging without review
- ❌ Breaking existing functionality

## Security

- Never hardcode credentials
- Validate all user inputs
- Sanitize file uploads
- Review security implications of dependencies

## Code Review Checklist

- [ ] Follows style guidelines
- [ ] No AI-generated comments
- [ ] All tests pass
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Documentation updated
- [ ] No security vulnerabilities
