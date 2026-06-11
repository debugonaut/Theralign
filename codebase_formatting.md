# AI-Native Codebase Knowledge Management System
## Production-Grade Context Layer for AI Coding Agents

---

## The Problem This Solves

Every AI coding session on a mature codebase starts with the same waste: the agent scans hundreds of files to rediscover architecture it has seen before, burns context window on boilerplate it does not need, makes proposals that conflict with decisions already made, and breaks existing patterns because it never knew they existed.

This is not an AI capability problem. It is an information architecture problem. The codebase contains everything the agent needs to know but presents it in the worst possible format for efficient consumption — raw source files with no hierarchy, no summary layer, no relevance ranking, and no memory of why things were built the way they were.

This system solves that by building a continuously maintained knowledge layer that sits between the codebase and every AI agent that works on it. The agent reads the knowledge layer first. It reads source files only when the knowledge layer tells it to and only the specific files it needs. Token consumption drops by 80–90%. Response quality improves because the agent operates with accurate architectural context rather than inferred guesses.

The target environments are production React, Next.js, Node.js, TypeScript, and monorepo codebases. The immediate use case is Theralign — a 13-phase production SaaS with 60+ live API endpoints, three role-based dashboards, and a codebase that grows with every sprint.

---

## Design Principles

**Summaries over source.** The agent should never read a source file when a summary exists. Summaries are the default. Source files are the exception.

**Graph traversal over scanning.** Finding what affects authentication means querying a dependency graph, not reading every import statement in every file.

**Staleness is visible, not silent.** Every piece of knowledge in the system carries a timestamp and a staleness flag. An outdated summary that the agent trusts is worse than no summary at all.

**The system maintains itself.** Manual maintenance is a failure mode. Every index, every summary, every graph must update automatically on code change. If a human has to remember to update the knowledge base, the knowledge base will be wrong within a week.

**Progressive depth.** Context is served in four levels. The agent reads the minimum level required and stops. It never reads Level 4 unless Levels 1 through 3 are insufficient.

```
Level 1 — Project summary (what the system is, what it does)
Level 2 — Subsystem summary (what this part of the system does)
Level 3 — Relevant file list (which specific files to read)
Level 4 — Actual source code (read only when required)
```

---

## Storage Architecture

```
.ai/
├── context/
│   ├── project-summary.md          # Level 1 — first file every agent reads
│   ├── recent-changes.md           # Last 7 days of architectural activity
│   └── active-decisions.md         # Current ADRs the agent must not contradict
│
├── indexes/
│   ├── architecture-index.json     # All subsystems and their metadata
│   ├── feature-index.json          # All features mapped to files, routes, APIs
│   ├── dependency-graph.json       # Import/export/call graph across codebase
│   ├── ownership-index.json        # Module → owner mapping
│   └── staleness-manifest.json     # Which index entries are out of date
│
└── adr/
    ├── ADR-001.md
    ├── ADR-002.md
    └── ...

docs/
├── architecture.md                 # Human-readable architecture overview
├── features.md                     # Human-readable feature map
└── development-rules.md            # Conventions the agent must follow
```

---

## Component 1 — Project Summary

**File:** `.ai/context/project-summary.md`
**Target size:** 5–15KB
**Update frequency:** On any structural change to architecture, models, or APIs

This is the first file every AI agent reads at the start of every session. It must be complete enough that an agent with no prior context can understand the system without reading anything else. It must be compressed enough to consume minimal tokens.

**Required sections:**

**Product purpose** — one paragraph. What the system does, who uses it, what problem it solves. Not marketing copy — operational description.

**Architecture overview** — the major subsystems, their responsibilities, and how they relate to each other. Expressed as a structured list, not prose. Each subsystem gets three lines maximum at this level.

**Technology decisions** — the stack, the deployment targets, and any non-obvious technology choices with a one-line reason for each. An agent that does not know Razorpay requires paise not rupees will break the payment flow. This section prevents that.

**Database summary** — every model, its primary fields, and its relationships. Not schema-level detail — entity-level overview. Enough that the agent knows what collections exist and what they contain before touching any database code.

**API surface summary** — grouped by resource. Not every endpoint — the resource groups and their purposes. The feature index contains endpoint-level detail.

**Active constraints** — things the agent must not do. Do not modify the server directory. Do not change API contracts. Do not introduce new dependencies without noting them. Do not change the fee snapshot logic. These constraints are extracted from ADRs and from development rules and presented as a flat list at the top of the agent's context. The agent reads constraints before it reads anything else.

**Coding conventions** — naming patterns, file organization rules, error handling patterns, response format standards. Specific enough that the agent's output matches the existing codebase without correction.

---

## Component 2 — Architecture Index

**File:** `.ai/indexes/architecture-index.json`
**Update frequency:** On any new file, deleted file, or significant refactor

A machine-readable registry of every major subsystem in the codebase. Each entry is a structured object the query engine uses to route agent requests to the correct subsystem before showing file-level detail.

**Each subsystem entry contains:**

```
id:                  unique identifier (kebab-case)
name:                human-readable name
purpose:             one sentence
responsibilities:    array of strings
entryPoints:         array of file paths
relatedFiles:        array of file paths
dependsOn:           array of subsystem ids and external services
consumedBy:          array of subsystem ids
externalServices:    array of service names with purpose
lastUpdated:         ISO timestamp
sourceFilesHash:     hash of all related files — changes when source changes
stale:               boolean — true when sourceFilesHash no longer matches
```

The `stale` flag is computed automatically by comparing the stored hash against the current file state on every knowledge base refresh. An agent that queries the architecture index and receives a stale entry is warned before it acts on that information.

**Example entry for the payment subsystem on Theralign:**

```
id: payments
name: Payment System
purpose: Handles Razorpay order creation, signature verification, and payment history
responsibilities:
  - Create Razorpay orders linked to appointments
  - Verify HMAC-SHA256 payment signatures
  - Store payment records with financial snapshots
  - Provide payment history to patients and admin
entryPoints:
  - server/src/controllers/payment.controller.js
  - server/src/routes/payment.routes.js
relatedFiles:
  - server/src/models/Payment.model.js
  - server/src/models/Appointment.model.js
dependsOn:
  - appointments
  - razorpay-sdk
consumedBy:
  - patient-dashboard
  - admin-analytics
externalServices:
  - Razorpay: order creation and payment capture
criticalConstraints:
  - Amount must be converted to paise (multiply by 100) before Razorpay API call
  - Fee snapshot must be read from Appointment model not Doctor model
  - Signature verification must occur before any database update
lastUpdated: 2025-05-30T14:22:00Z
stale: false
```

---

## Component 3 — Feature Index

**File:** `.ai/indexes/feature-index.json`
**Update frequency:** On any new feature, new route, new component, or model change

A feature-level map of the entire product. Where the architecture index describes subsystems, the feature index describes user-facing features. An agent working on the booking flow should query the feature index, not the architecture index.

**Each feature entry contains:**

```
id:                  unique identifier
name:                human-readable feature name
description:         two sentences maximum
userRoles:           which roles interact with this feature
routes:              array of frontend routes
apiEndpoints:        array of backend endpoints with method and path
components:          array of frontend component file paths
models:              array of Mongoose model names used
controllers:         array of controller file paths
services:            array of service file paths
relatedFeatures:     array of feature ids that share models or components
knownConstraints:    array of business rules the agent must not violate
lastUpdated:         ISO timestamp
stale:               boolean
```

**Example entry for the appointment booking feature:**

```
id: appointment-booking
name: Appointment Booking
description: Allows authenticated patients to book an available slot with a
             verified doctor. Atomic slot locking prevents double-booking.
userRoles: [patient]
routes:
  - /doctors/:id (slot picker embedded in profile page)
  - /patient/appointments
apiEndpoints:
  - POST /api/appointments/book
  - GET /api/availability/:doctorId/available
components:
  - client/src/components/booking/SlotPicker.jsx
  - client/src/components/booking/BookingConfirmationModal.jsx
  - client/src/pages/public/DoctorProfile.jsx
models:
  - Appointment
  - AvailabilitySlot
  - DoctorProfile
controllers:
  - server/src/controllers/appointment.controller.js
  - server/src/controllers/availability.controller.js
knownConstraints:
  - Slot locking uses findOneAndUpdate with isBooked:false condition — do not change to find then save
  - consultationFee must be snapshotted from DoctorProfile at booking time
  - platformCommission is always 10 percent calculated at booking time
  - Slot must be unlocked if Appointment creation fails after lock
relatedFeatures:
  - payment-flow
  - availability-management
  - appointment-media-upload
lastUpdated: 2025-05-30T14:22:00Z
stale: false
```

---

## Component 4 — Dependency Graph

**File:** `.ai/indexes/dependency-graph.json`
**Update frequency:** On any import change, export change, or service relationship change

A traversable graph of every dependency relationship in the codebase. The primary use case is impact analysis — before an agent modifies a file, it queries the graph to understand what else that change affects.

**Graph node types:**

- `file` — a source file
- `model` — a Mongoose model
- `service` — a service module
- `controller` — a controller
- `component` — a React component
- `external` — an external service (Razorpay, Cloudinary, OpenAI)

**Graph edge types:**

- `imports` — file A imports from file B
- `uses-model` — controller or service uses a Mongoose model
- `calls` — function in file A calls function in file B
- `renders` — component A renders component B
- `depends-on-external` — file depends on an external service

**Supported queries the system must answer:**

```
"Which files are affected if I change the Appointment model?"
→ Traverse all uses-model edges from Appointment node
→ Return list of controllers, services, and components

"Which components does DoctorProfile.jsx render?"
→ Traverse all renders edges from DoctorProfile node
→ Return component tree

"What depends on the Razorpay external service?"
→ Traverse all depends-on-external edges pointing to Razorpay
→ Return file list with subsystem context

"What would break if payment.controller.js changed?"
→ Traverse all imports and calls edges pointing to payment.controller.js
→ Return affected files with their subsystem membership
```

The graph is stored as an adjacency list in JSON. The query engine traverses it using breadth-first search with a configurable depth limit. Default depth is 3 — sufficient for most impact analysis without returning the entire graph.

---

## Component 5 — ADR System

**File:** `.ai/adr/ADR-NNN.md`
**Update frequency:** Manually, when an architectural decision is made or revised
**Consumed by:** `.ai/context/active-decisions.md` — auto-compiled from all ADRs

Architectural Decision Records are the system's long-term memory. They answer the question every AI agent eventually asks: "why is it done this way?" Without ADRs, the agent proposes changes that seem reasonable in isolation but contradict decisions made for good reasons months ago.

**Each ADR contains:**

```
ADR-NNN — [Decision Title]

Status: [Accepted | Deprecated | Superseded by ADR-NNN]

Context:
What situation required this decision. The business or technical
constraint that made the decision necessary.

Decision:
What was decided. Stated as a fact, not a recommendation.
One paragraph maximum.

Consequences:
What this decision requires of all future code in this area.
Expressed as imperatives the agent must follow.

Alternatives Considered:
What other approaches were evaluated and why they were rejected.
This prevents the agent from re-proposing rejected alternatives.

Supersedes: [ADR-NNN if applicable]
```

**Example ADR for Theralign:**

```
ADR-004 — Consultation Fee Snapshotted at Booking Time

Status: Accepted

Context:
Doctors can update their consultation fee at any time. Appointments
created before a fee change must reflect the fee that was in effect
when the patient booked, not the current fee.

Decision:
The consultationFee, platformCommission, and doctorEarnings fields
on the Appointment model are written at booking time by reading the
current DoctorProfile.consultationFee and calculating 10/90 percent
splits. These values are never recalculated after the appointment
is created. They are never read from the DoctorProfile after booking.

Consequences:
- Any code that displays appointment fees must read from Appointment,
  not from DoctorProfile
- Any code that calculates commission must read from Appointment,
  not recalculate from current DoctorProfile fee
- Admin analytics that sum revenue must aggregate Appointment fields,
  not join with DoctorProfile

Alternatives Considered:
- Store only the appointment reference and calculate fee dynamically:
  rejected because a fee change would retroactively alter historical
  revenue figures and patient-visible appointment records
- Store fee in a separate PriceHistory model: rejected as unnecessary
  complexity when a snapshot field on Appointment is sufficient
```

Active ADRs are compiled automatically into `.ai/context/active-decisions.md` — a flat list of constraints every agent reads as part of its Level 1 context. The agent does not need to read individual ADR files unless it needs the full reasoning.

---

## Component 6 — Recent Changes Intelligence

**File:** `.ai/context/recent-changes.md`
**Update frequency:** On every commit, generated from git log
**Target size:** 2–5KB covering the last 7 days

An AI agent working on a bug introduced three days ago needs to know what changed three days ago. Without this, it reads the current source and makes inferences. With this, it reads a structured summary of recent activity and goes directly to the relevant files.

**Generated content:**

```
Recent Changes — Last 7 Days
Generated: [timestamp]

─── High Impact Changes ───────────────────────────────────

[date] — [commit hash short] — [author]
Summary: Added AppointmentMedia collection for pre-booking media uploads
Changed files:
  - server/src/models/AppointmentMedia.model.js [new]
  - server/src/controllers/media.controller.js [new]
  - server/src/routes/media.routes.js [new]
  - client/src/components/booking/MediaUpload.jsx [new]
  - client/src/components/booking/BookingConfirmationModal.jsx [modified]
Affected subsystems: appointment-booking, cloudinary-storage
ADR impact: none
Regression risk: BookingConfirmationModal — existing booking flow modified

─── Routine Changes ───────────────────────────────────────

[date] — [commit hash short]
Summary: Fixed slot unlock race condition on cancellation
Changed files:
  - server/src/controllers/appointment.controller.js [modified]
Affected subsystems: appointment-booking
Regression risk: low
```

High-impact changes are flagged automatically based on: new files added to core models or controllers, modifications to files with high in-degree in the dependency graph, changes to authentication or payment flows.

---

## Component 7 — Staleness Management

**File:** `.ai/indexes/staleness-manifest.json`
**Update frequency:** On every commit, before any agent session

The system is only useful if its contents are accurate. Stale knowledge that the agent trusts is actively harmful — it sends the agent to wrong files, gives it wrong constraints, and produces wrong output.

Every index entry stores a hash of the source files it covers. On each refresh, the system recomputes hashes and compares. Any entry whose hash no longer matches its source files is marked stale. The staleness manifest is a flat list of all stale entries across all indexes.

**Agent behavior on stale entries:**

When an agent queries the knowledge base and receives a stale result, the response includes a staleness warning:

```
⚠ STALE — This entry was last updated 2025-05-27.
The following source files have changed since this entry was generated:
  - server/src/controllers/appointment.controller.js
  - server/src/models/Appointment.model.js

Recommendation: Read source files directly for these components
before acting on this summary.
```

The agent falls back to reading source files for stale entries only. Fresh entries are trusted without source file verification.

---

## Component 8 — Smart Query Engine

The query engine is the interface between the AI agent and the knowledge base. It receives a natural language or structured query and returns the minimum context required to answer it.

**Query resolution sequence:**

```
1. Parse query intent
   — Is this a bug fix? A new feature? A refactor? A question?

2. Map intent to feature index
   — Which feature does this query relate to?
   — Return feature entry if found

3. Expand to architecture index
   — Which subsystems does this feature touch?
   — Return subsystem entries for affected systems

4. Check staleness manifest
   — Are any returned entries stale?
   — Flag stale entries and recommend source file fallback

5. Query dependency graph
   — What files are directly involved?
   — What files would be affected by changes to those files?

6. Check recent changes
   — Has anything relevant changed in the last 7 days?
   — Surface any high-impact recent changes to relevant files

7. Check ADR constraints
   — Are there active decisions that constrain this work?
   — Return relevant ADR summaries

8. Compose response
   — Feature context
   — Relevant file list ranked by relevance
   — Staleness warnings
   — Active constraints
   — Recent changes to relevant files
```

**Example query and response:**

Query: `Add a field to track whether a patient completed their prescribed exercises`

```
Feature match: session-records (Phase 14 — care continuity)

Relevant subsystems:
  - appointment-booking (Appointment model — parent record)
  - session-records (SessionRecord model — target location)

Relevant files (ranked):
  1. server/src/models/SessionRecord.model.js — model to modify
  2. server/src/controllers/sessionRecord.controller.js — controller to update
  3. client/src/pages/patient/MyAppointments.jsx — patient-facing display
  4. client/src/pages/doctor/DoctorAppointments.jsx — doctor-facing entry

Active constraints:
  - ADR-004: Fee fields on Appointment are immutable after booking
  - ADR-007: Session records are a separate collection from Appointment

Recent changes:
  - 2025-05-28: SessionRecord model created (new)
  - No changes to Appointment model in last 7 days

Staleness: all entries current

Recommended entry point: server/src/models/SessionRecord.model.js
```

---

## Component 9 — Automatic Update Pipeline

**Trigger events:** git commit, branch switch, pull request open, merge

The update pipeline runs as a git hook or CI step. It never requires manual invocation.

**Pipeline sequence on commit:**

```
1. Detect changed files from git diff
2. Identify which index entries cover changed files
3. Recompute hashes for affected entries
4. Mark stale entries in staleness manifest
5. Regenerate stale entries using extraction engine
6. Update recent-changes.md from git log
7. Recompile active-decisions.md from ADR directory
8. Validate all file paths in all indexes against filesystem
   — Remove references to deleted files
   — Flag references to renamed files as stale
9. Write updated indexes to .ai/
10. Log: N entries updated, M entries remain stale, pipeline duration
```

**Filesystem validation** in step 8 is the most important step. A knowledge base with references to files that no longer exist is worse than no knowledge base. Every refresh must verify that every file path in every index actually exists. Dead references are removed automatically. The agent is never sent to a file that does not exist.

---

## Implementation for Theralign Specifically

For Theralign at its current state — Phase 13 complete, 60+ endpoints, three dashboards — the initial knowledge base generation produces:

**Architecture index entries:** authentication, doctor-profiles, patient-profiles, discovery-search, availability-management, appointment-booking, payment-system, review-ratings, ai-integration, admin-operations, notification-system, refund-system, document-storage, waitlist-system, session-records (Phase 14)

**Feature index entries:** one entry per feature across all 13 phases plus Phase 14 additions

**ADR entries to create immediately:**

```
ADR-001 — Atomic slot locking via findOneAndUpdate
ADR-002 — Separate Payment collection from Appointment
ADR-003 — Cloudinary resource_type raw for PDF uploads
ADR-004 — Fee snapshot at booking time
ADR-005 — Indian number formatting (en-IN locale)
ADR-006 — Fire-and-forget email sending (never await in booking flow)
ADR-007 — Session records as separate collection from Appointment
ADR-008 — AppointmentMedia as separate collection with uploadedBy field
```

**Development rules to encode in `docs/development-rules.md`:**

```
- Server directory is never touched by frontend changes
- API contracts are never changed without a new ADR
- No new npm dependencies without noting them in the commit
- All monetary values stored in rupees in database, converted to
  paise only at Razorpay API call site
- All date comparisons use YYYY-MM-DD string format not Date objects
- consultationFee always read from Appointment not DoctorProfile
  after booking creation
- Role guards enforced at route level not controller level
- asyncHandler wrapper required on all controller functions
```

---

## Success Criteria

An AI agent session on Theralign that previously required ingesting 80+ files to understand context should require ingesting:

- `.ai/context/project-summary.md` — always
- `.ai/context/active-decisions.md` — always
- `.ai/context/recent-changes.md` — always
- 2–5 specific source files identified by the query engine — per task

Total tokens consumed per session: reduced by 85–90% compared to naive full-repository ingestion.

Output quality improves because the agent operates with accurate architectural context, known constraints, and awareness of recent changes — rather than inferred architecture, unknown constraints, and no awareness of what changed yesterday.

The system pays for its own maintenance cost within the first five AI coding sessions on any non-trivial task.

# Phase 2 — Advanced Retrieval and Agent Intelligence

The current architecture solves repository-level understanding. Phase 2 solves function-level understanding, agent memory, and semantic retrieval.

These additions are mandatory if the goal is to support large production repositories where AI agents must operate with minimal token consumption and maximal precision.

---

## Component 10 — Semantic Retrieval Layer

The Architecture Index and Feature Index work well when the query maps directly to known subsystems or features.

However, developers rarely think in architecture terms.

They ask questions like:

* "Where is therapist payout logic calculated?"
* "Where do we generate invoices?"
* "Why does booking fail after payment?"
* "Where is the commission split happening?"

These queries may not correspond directly to feature names.

A semantic retrieval layer must exist.

### Storage

```text
.ai/search/
├── file-summaries.json
├── symbol-summaries.json
├── embeddings.db
└── search-index.json
```

### File Summaries

Every source file receives a generated summary.

Example:

```json
{
  "file": "payment.controller.ts",
  "summary": "Creates Razorpay orders, verifies signatures, stores payment snapshots, updates appointment payment status, and triggers post-payment workflows.",
  "keywords": [
    "payments",
    "razorpay",
    "orders",
    "signature verification",
    "billing"
  ]
}
```

### Retrieval Behavior

When an agent receives a query:

```text
Where are therapist payouts calculated?
```

The system performs semantic retrieval before graph traversal.

Expected result:

```text
Relevant Files:
1. payout.service.ts
2. payment.controller.ts
3. finance.analytics.ts
```

without requiring repository-wide scanning.

---

## Component 11 — Symbol Index

File-level retrieval is insufficient for large files.

Many production files exceed 1000–5000 lines.

The system must support symbol-level navigation.

### Storage

```text
.ai/indexes/
└── symbol-index.json
```

### Indexed Symbols

* Functions
* Classes
* Interfaces
* React Components
* Hooks
* API Handlers
* Utility Methods

### Example

```json
{
  "symbol": "calculatePlatformCommission",
  "type": "function",
  "file": "billing.service.ts",
  "lineStart": 120,
  "lineEnd": 185,
  "summary": "Calculates platform commission using appointment fee snapshots and current commission rules."
}
```

### Supported Queries

```text
Where is commission calculated?

Which function creates Razorpay orders?

Which component renders the slot picker?

Where is appointment cancellation handled?
```

The query engine should return symbols before files whenever possible.

The objective is:

```text
Repository
→ File
→ Symbol
```

instead of

```text
Repository
→ Entire File
```

This dramatically reduces token usage.

---

## Component 12 — Agent Activity Memory

The system should maintain a memory of previous AI work.

Without this, agents repeatedly rediscover the same reasoning and duplicate investigations.

### Storage

```text
.ai/memory/
├── agent-activity.json
├── investigation-log.json
└── implementation-history.json
```

### Example Entry

```json
{
  "timestamp": "2026-06-11T18:22:00Z",
  "task": "Fixed appointment booking race condition",
  "filesModified": [
    "appointment.controller.ts"
  ],
  "reasoning": [
    "Preserved atomic slot locking",
    "Did not introduce transactions"
  ],
  "constraintsReferenced": [
    "ADR-001"
  ]
}
```

### Purpose

Future agents can inspect:

* What was changed
* Why it was changed
* Which ADRs influenced decisions
* Which alternatives were rejected

before proposing new changes.

This reduces repeated analysis and architectural drift.

---

## Component 13 — Engineering Philosophy Layer

Many AI mistakes are not technical mistakes.

They are philosophical mistakes.

The agent proposes solutions that technically work but violate the project's engineering principles.

### Storage

```text
.ai/context/
└── engineering-philosophy.md
```

### Example Contents

```md
# Engineering Philosophy

- Prefer boring solutions over clever solutions
- Minimize dependencies
- Preserve existing patterns
- Explicit code over abstraction
- Server-first architecture
- Simplicity over flexibility
- Optimize for maintainability
- Avoid framework churn
- Avoid premature optimization
```

### Purpose

The agent reads this file before planning any implementation.

It acts as a decision-making compass.

Two agents with the same codebase but different engineering philosophies will produce very different solutions.

This file aligns agent behavior with team preferences.

---

## Component 14 — Repository Knowledge Graph

The Dependency Graph should evolve into a Repository Knowledge Graph.

The graph should contain:

### Node Types

```text
Subsystem
Feature
File
Symbol
Model
Controller
Service
Component
API Endpoint
Database Table
External Service
ADR
```

### Edge Types

```text
implements
depends_on
uses
calls
renders
owns
constrained_by
introduced_by
modified_by
related_to
```

### Example

Appointment Booking
→ uses Appointment Model

Appointment Model
→ constrained_by ADR-004

ADR-004
→ introduced_by Commit abc123

Commit abc123
→ modified appointment.controller.ts

This allows agents to reason across architecture, implementation, history, and decisions using graph traversal rather than source scanning.

---

## Component 15 — Relevance Ranking Engine

Not all files returned by retrieval are equally useful.

The system must rank relevance.

### Ranking Factors

* Semantic similarity score
* Architectural proximity
* Dependency graph distance
* Recent modification activity
* ADR relevance
* Historical agent activity
* Bug hotspot frequency

### Example Query

```text
Fix booking cancellation bug
```

Expected ranking:

```text
1. appointment.controller.ts
2. cancellation.service.ts
3. Appointment.model.ts
4. booking.routes.ts
5. notification.service.ts
```

The AI should read files in ranked order until confidence is sufficient.

This minimizes token consumption.

---

## Ultimate Objective

The final system should enable the following workflow:

```text
User Query
      ↓
Intent Detection
      ↓
Semantic Retrieval
      ↓
Feature Identification
      ↓
Architecture Context
      ↓
Knowledge Graph Traversal
      ↓
Symbol Selection
      ↓
Source Code Retrieval
      ↓
Implementation
```

The agent should never begin by scanning source code.

The agent should begin by understanding.

Source code becomes the final step, not the first step.

Success is achieved when an AI agent can accurately identify the exact subsystem, file, and function required for a task while reading less than 10% of the repository context that a traditional agent would consume.
