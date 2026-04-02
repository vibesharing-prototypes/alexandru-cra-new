# Git Process

> This document covers the Git workflow used for developing the **CRA prototype**. Follow these steps to keep the codebase stable and your changes organized.

---

## How Git works

Git has three local layers and a remote. Every change you make travels through these stages before it reaches the shared repository.

| Layer | Role |
|---|---|
| **Working directory** | The files you see and edit in Cursor |
| **Staging area** | A holding zone for changes you've marked as ready to commit |
| **Local repository** | The full history of commits on your machine |
| **Remote (GitHub)** | The shared copy at `github.com/dil-ahasmatuchi/CRA_Proto` |

**Flow:** edit → `git add` → stage → `git commit` → local repo → `git push` → GitHub

---

## Branching workflow

Always work on a **branch** instead of committing directly to `main`. This keeps the live prototype stable while you make changes.

### Step 1 — Create a branch

Switch to a new branch before you start any work.

```bash
git checkout -b my-feature-name
```

Use a descriptive name like `update-heatmap` or `add-vulnerabilities-page`.

---

### Step 2 — Make changes

Edit files in Cursor as usual. Check what's changed at any time.

- `git status` — shows which files have changed
- `git diff` — shows the line-by-line changes

---

### Step 3 — Stage and commit

When you're happy with a set of changes, stage them and save a snapshot.

```bash
git add -A
git commit -m "description of change"
```

> **Tip:** Commit as often as you like. Commits are save points you can always go back to.

---

### Step 4 — Push to GitHub

The first time you push a new branch, use the `-u` flag to link it to the remote.

```bash
git push -u origin my-feature-name
```

After the first push, `git push` alone is enough for subsequent commits.

> At this point your changes are on GitHub **on your branch** — `main` is untouched.

---

### Step 5 — Merge to main

When you're satisfied the changes are ready, bring them into `main`.

#### Option A — Merge locally

```bash
git checkout main
git pull
git merge my-feature-name
git push
```

#### Option B — Pull Request on GitHub *(recommended)*

Push your branch, then open a Pull Request from `my-feature-name` into `main`. This lets you review changes before merging.

> You can ask the AI assistant in Cursor to create a PR for you in Agent mode.

---

### Step 6 — Clean up

After merging, delete the branch to keep things tidy.

```bash
git branch -d my-feature-name              # delete locally
git push origin --delete my-feature-name   # delete on GitHub
```

---

## Quick reference

| What you want to do | Command |
|---|---|
| See what branch you're on | `git branch` |
| Create and switch to a new branch | `git checkout -b branch-name` |
| Switch to an existing branch | `git checkout branch-name` |
| See what files changed | `git status` |
| See line-by-line changes | `git diff` |
| Stage all changes | `git add -A` |
| Commit staged changes | `git commit -m "message"` |
| Push branch to GitHub (first time) | `git push -u origin branch-name` |
| Push subsequent commits | `git push` |
| Get latest from GitHub | `git pull` |
| Merge a branch into current branch | `git merge branch-name` |

---

## Example: end-to-end feature change

A complete walkthrough from start to finish.

```bash
# 1. Start a new branch
git checkout -b update-heatmap-layout

# 2. Make changes in Cursor...

# 3. Stage and commit
git add -A
git commit -m "update heatmap cell positions"

# 4. Push to GitHub (main is safe)
git push -u origin update-heatmap-layout

# 5. When ready, merge to main
git checkout main
git pull
git merge update-heatmap-layout
git push

# 6. Clean up
git branch -d update-heatmap-layout
git push origin --delete update-heatmap-layout
```

---

## Using the AI assistant in Cursor

In **Agent mode**, you can ask the assistant to handle Git operations for you. Try prompts like:

- *"Create a new branch called update-heatmap"*
- *"Commit and push my changes"*
- *"Create a pull request"*
- *"Merge my branch into main"*
