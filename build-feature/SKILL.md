---
name: build-feature
description: "Autonomous task loop that picks ready tasks, implements them, updates progress.txt, commits, and repeats. Use when asked to 'build feature', 'run the loop', or 'implement these tasks'."
---

# Build Feature Loop

Autonomous task execution loop that implements tasks one by one until complete.

---

## Workflow

### 0. Get the parent task ID

First, read the parent task ID that scopes this feature:

```bash
cat scripts/build-feature-loop/parent-task-id.txt
```

If this file doesn't exist, ask the user which parent task to work on.

**Check if this is a new feature:** Compare the parent task ID to the one in progress.txt header. If they differ (or progress.txt doesn't exist), this is a NEW feature - reset progress.txt:

```markdown
# Build Progress Log
Started: [today's date]
Feature: [parent task title]

## Codebase Patterns
(Patterns discovered during this feature build)

---
```

This ensures each feature starts with a clean slate. Progress.txt is SHORT-TERM memory for the current feature only.

### 1. Check for ready tasks (with nested hierarchy support)

The task hierarchy may have multiple levels (parent → container → leaf tasks). Use this approach to find all descendant tasks:

**Step 1: Get all tasks for the repo**
```
task_list action: "list", repoURL: "<repo-url>", ready: true, status: "open"
```

**Step 2: Build the descendant set**
Starting from the parent task ID, collect all tasks that are descendants:
1. Find tasks where `parentID` equals the parent task ID (direct children)
2. For each child found, recursively find their children
3. Continue until no more descendants are found

**Step 3: Filter to workable tasks**
From the descendant set, select tasks that are:
- `ready: true` (all dependencies satisfied)
- `status: "open"` 
- Leaf tasks (no children of their own) - these are the actual work items

**CRITICAL:** Skip container tasks that exist only to group other tasks. A container task has other tasks with its ID as their `parentID`.

### 2. If no ready tasks

Check if all descendant tasks are completed:
- Query `task_list list` with `repoURL: "<repo-url>"` (no ready filter)
- Build the full descendant set (same recursive approach as step 1)
- If all leaf tasks in the descendant set are `completed`:
  1. Archive progress.txt: `mv scripts/build-feature-loop/progress.txt scripts/build-feature-loop/archive/[feature-name]-[date].txt`
  2. Create fresh progress.txt with empty template
  3. Clear parent-task-id.txt: `echo "" > scripts/build-feature-loop/parent-task-id.txt`
  4. Commit: `git add scripts/build-feature-loop && git commit -m "chore: archive progress for [feature-name]"`
  5. Mark the parent task as `completed`
  6. Stop and report "✅ Build complete - all tasks finished!"
- If some are blocked: Report which tasks are blocked and why

### 3. If ready tasks exist

**Pick the next task:**
- Prefer tasks related to what was just completed (same module/area, dependent work)
- If no prior context, pick the first ready task

**Execute the task:**

Use the `handoff` tool with this goal:

```
Implement and verify task [task-id]: [task-title].

[task-description]

FIRST: Read scripts/build-feature-loop/progress.txt - check the "Codebase Patterns" section for important context from previous iterations.

When complete:

1. Run quality checks: `npm run typecheck` and `npm test`
   - If either fails, FIX THE ISSUES and re-run until both pass
   - Do NOT proceed until quality checks pass

2. Update AGENTS.md files if you learned something important:
   - Check for AGENTS.md in directories where you edited files
   - Add learnings that future developers/agents should know (patterns, gotchas, dependencies)
   - This is LONG-TERM memory - things anyone editing this code should know
   - Do NOT add task-specific details or temporary notes

3. Update progress.txt (APPEND, never replace) - this is SHORT-TERM memory for the current feature:
   ```
   ## [Date] - [Task Title]
   Thread: [current thread URL]
   Task ID: [task-id]
   - What was implemented
   - Files changed
   - **Learnings for future iterations:**
     - Patterns discovered
     - Gotchas encountered
     - Useful context
   ---
   ```

4. If you discovered a reusable pattern for THIS FEATURE, add it to the `## Codebase Patterns` section at the TOP of progress.txt

5. Commit all changes with message: `feat: [Task Title]`

6. Mark task as completed: `task_list action: "update", taskID: "[task-id]", status: "completed"`

7. Invoke the build-feature skill to continue the loop
```

---

## Progress File Location

The progress file should be at `scripts/build-feature-loop/progress.txt` (or create one if working in a different repo).

### Progress File Format

```markdown
# Build Progress Log
Started: [date]
Feature: [feature name]
Parent Task: [parent-task-id]

## Codebase Patterns
(Patterns discovered during this feature build)

---

## [Date] - [Task Title]
Thread: https://ampcode.com/threads/[thread-id]
Task ID: [id]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
---
```

**Note:** When a new feature starts with a different parent task ID, reset progress.txt completely. Long-term learnings belong in AGENTS.md files, not progress.txt.

---

## Task Discovery

While working, **liberally create new tasks** when you discover:
- Failing tests or test gaps
- Code that needs refactoring
- Missing error handling
- Documentation gaps
- TODOs or FIXMEs in the code
- Build/lint warnings
- Performance issues

Use `task_list action: "create"` immediately. Set appropriate `dependsOn` relationships.

---

## Quality Requirements

Before marking any task complete:
- `npm run typecheck` must pass
- `npm test` must pass
- Changes must be committed
- Progress must be logged

---

## Stop Condition

When no ready tasks remain AND all tasks are completed:
1. Output: "✅ Build complete - all tasks finished!"
2. Summarize what was accomplished

---

## Important Notes

- Always use `ready: true` when listing tasks to only get tasks with satisfied dependencies
- Each handoff runs in a fresh thread with clean context
- Progress.txt is the memory between iterations - keep it updated
- Prefer tasks in the same area as just-completed work for better context continuity
- The handoff goal MUST include instructions to update progress.txt, commit, and re-invoke this skill
