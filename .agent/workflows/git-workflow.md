---
description: How to create a feature branch and push changes
---

# Git Workflow: Feature Branch Development

This workflow ensures all changes are made on feature branches before merging to main.

## Steps

### 1. Create a new feature branch
```bash
git checkout -b feature/your-feature-name
```
Replace `your-feature-name` with a descriptive name (e.g., `feature/improve-ui`, `feature/add-caching`, `fix/light-mode`)

### 2. Make your changes
Edit files as needed for your feature or fix.

### 3. Stage your changes
```bash
git add -A
```
Or stage specific files:
```bash
git add path/to/file
```

### 4. Commit your changes
```bash
git commit -m "type: descriptive commit message"
```
Commit types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 5. Push the feature branch to GitHub
```bash
git push -u origin feature/your-feature-name
```

### 6. Create a Pull Request on GitHub
1. Go to https://github.com/ankit7610/CurrencyWebApp
2. Click "Compare & pull request"
3. Add a description of your changes
4. Click "Create pull request"

### 7. Merge the Pull Request
Once reviewed and approved:
1. Click "Merge pull request" on GitHub
2. Click "Confirm merge"
3. Optionally delete the branch on GitHub

### 8. Update your local main branch
```bash
git checkout main
git pull origin main
```

### 9. Delete the local feature branch (optional)
```bash
git branch -d feature/your-feature-name
```

## Quick Reference

```bash
# Create and switch to new branch
git checkout -b feature/my-feature

# Stage and commit changes
git add -A
git commit -m "feat: add new feature"

# Push to GitHub
git push -u origin feature/my-feature

# After merging PR, update local main
git checkout main
git pull origin main
git branch -d feature/my-feature
```

## Branch Naming Conventions

- `feature/` - New features (e.g., `feature/dark-mode`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `docs/` - Documentation updates (e.g., `docs/readme-update`)
- `refactor/` - Code refactoring (e.g., `refactor/api-service`)
- `test/` - Test additions/updates (e.g., `test/add-unit-tests`)
