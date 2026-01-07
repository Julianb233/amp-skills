---
name: prd
description: "Generate a Product Requirements Document (PRD) for a new feature. Use when planning a feature, starting a new project, or when asked to create a PRD. Triggers on: create a prd, write prd for, plan this feature, requirements for, spec out."
---

# PRD Generator

Create detailed Product Requirements Documents that are clear, actionable, and suitable for implementation.

---

## The Job

1. Receive a feature description from the user
2. Ask 3-5 essential clarifying questions (with lettered options)
3. Generate a structured PRD based on answers
4. Save to `/tasks/prd-[feature-name].md`

**Important:** Do NOT start implementing. Just create the PRD.

---

## Step 1: Clarifying Questions

Ask only critical questions where the initial prompt is ambiguous. Focus on:

- **Problem/Goal:** What problem does this solve?
- **Core Functionality:** What are the key actions?
- **Scope/Boundaries:** What should it NOT do?
- **Success Criteria:** How do we know it's done?

### Format Questions Like This:

```
1. What is the primary goal of this feature?
   A. Improve user onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Other: [please specify]

2. Who is the target user?
   A. New users only
   B. Existing users only
   C. All users
   D. Admin users only

3. What is the scope?
   A. Minimal viable version
   B. Full-featured implementation
   C. Just the backend/API
   D. Just the UI
```

This lets users respond with "1A, 2C, 3B" for quick iteration.

---

## Step 2: PRD Structure

Generate the PRD with these sections:

### 1. Introduction/Overview
Brief description of the feature and the problem it solves.

### 2. Goals
Specific, measurable objectives (bullet list).

### 3. User Stories
Each story needs:
- **Title:** Short descriptive name
- **Description:** "As a [user], I want [feature] so that [benefit]"
- **Acceptance Criteria:** Verifiable checklist of what "done" means

Each story should be small enough to implement in one focused session.

**Format:**
```markdown
### US-001: [Title]
**Description:** As a [user], I want [feature] so that [benefit].

**Acceptance Criteria:**
- [ ] Specific verifiable criterion
- [ ] Another criterion
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill (for UI changes)
```

**Important:** Acceptance criteria must be verifiable, not vague. "Works correctly" is bad. "Button shows confirmation dialog before deleting" is good.

### 4. Functional Requirements
Numbered list of specific functionalities:
- "FR-1: The system must allow users to..."
- "FR-2: When a user clicks X, the system must..."

Be explicit and unambiguous.

### 5. Non-Goals (Out of Scope)
What this feature will NOT include. Critical for managing scope.

### 6. Design Considerations (Optional)
- UI/UX requirements
- Link to mockups if available
- Relevant existing components to reuse

### 7. Technical Considerations (Optional)
- Known constraints or dependencies
- Integration points with existing systems
- Performance requirements

### 8. Success Metrics
How will success be measured?
- "Reduce time to complete X by 50%"
- "Increase conversion rate by 10%"

### 9. Open Questions
Remaining questions or areas needing clarification.

---

## Writing for Junior Developers

The PRD reader may be a junior developer or AI agent. Therefore:

- Be explicit and unambiguous
- Avoid jargon or explain it
- Provide enough detail to understand purpose and core logic
- Number requirements for easy reference
- Use concrete examples where helpful

---

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `prd-[feature-name].md` (kebab-case)

---

## Example PRD

```markdown
# PRD: Friends Outreach Track

## Introduction

Add a "friends" investor type for warm outreach to network contacts. Instead of cold pitching for investment, friends receive a softer ask for deck feedback, which may lead to investment or introductions.

## Goals

- Allow categorizing investors as "cold" or "friend"
- Provide different messaging for friends (deck feedback vs cold pitch)
- Shorter follow-up sequence for friends (3 vs 5)
- Easy conversion between types from the investor list

## User Stories

### US-001: Add investorType field to database
**Description:** As a developer, I need to categorize investors as 'cold' or 'friend' so they get different outreach flows.

**Acceptance Criteria:**
- [ ] Add investorType column to investor table: 'cold' | 'friend' (default 'cold')
- [ ] Generate and run migration successfully
- [ ] npm run typecheck passes

### US-002: Add type toggle to investor list
**Description:** As Ryan, I want to toggle an investor between cold/friend directly from the list without clicking into their detail page.

**Acceptance Criteria:**
- [ ] Each investor row has a toggle: Cold | Friend
- [ ] Switching shows confirmation: 'Delete current tasks and create friend tasks?'
- [ ] On confirm: updates type, deletes tasks, regenerates with new templates
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Filter investors by type
**Description:** As Ryan, I want to filter the investor list to see just friends or just cold outreach.

**Acceptance Criteria:**
- [ ] Filter dropdown with options: All | Cold | Friend
- [ ] Filter persists in URL params
- [ ] npm run typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Add `investorType` field to investor table ('cold' | 'friend', default 'cold')
- FR-2: Display type toggle (Cold | Friend) in each investor list row
- FR-3: When switching type, show confirmation dialog explaining tasks will be regenerated
- FR-4: On type change, delete existing tasks and generate new ones with appropriate templates
- FR-5: Friends use 3 follow-ups; cold uses 5
- FR-6: Add type filter dropdown to investor list (All | Cold | Friend)

## Non-Goals

- No separate friend dashboard or metrics (use existing)
- No automated detection of who should be a friend
- No different channels for friends (same channels, different messages)

## Technical Considerations

- Reuse existing task generation infrastructure
- Message templates stored in outreach-templates.json
- Type stored in database, not computed

## Success Metrics

- Can convert any investor to friend in <3 clicks
- Friend messaging feels personal, not salesy
- No increase in task generation errors

## Open Questions

- Should friends have different timing between follow-ups?
- Should we track conversion rate (friend → investor) separately?
```

---

## Checklist

Before saving the PRD:

- [ ] Asked clarifying questions with lettered options
- [ ] Incorporated user's answers
- [ ] User stories are small and specific
- [ ] Functional requirements are numbered and unambiguous
- [ ] Non-goals section defines clear boundaries
- [ ] Saved to `/tasks/prd-[feature-name].md`
