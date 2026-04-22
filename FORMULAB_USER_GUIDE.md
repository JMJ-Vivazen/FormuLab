# FormuLab — User Guide

FormuLab is the Vivazen R&D QMS platform for managing product development from initial idea through launch readiness. It tracks projects through a stage-gate lifecycle, controls formulation versions, manages physical sample lots under QP-245 traceability rules, records sensory feedback, and maintains a materials master with COA status.

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [Navigation](#2-navigation)
3. [Dashboard](#3-dashboard)
4. [Projects](#4-projects)
5. [Formulations](#5-formulations)
6. [Samples](#6-samples)
7. [Feedback](#7-feedback)
8. [Materials](#8-materials)
9. [Gate Reviews](#9-gate-reviews)
10. [Key Workflows](#10-key-workflows)
    - [Starting a new project](#101-starting-a-new-project)
    - [Moving a project through gates](#102-moving-a-project-through-gates)
    - [Creating and revising formulations](#103-creating-and-revising-formulations)
    - [Freezing a formula at G4](#104-freezing-a-formula-at-g4)
    - [Logging a sample lot](#105-logging-a-sample-lot)
    - [Recording sensory feedback](#106-recording-sensory-feedback)
    - [Managing materials and COA status](#107-managing-materials-and-coa-status)
11. [Data Concepts Reference](#11-data-concepts-reference)
    - [Stage gates (G0–G6)](#111-stage-gates-g0g6)
    - [Gate decisions](#112-gate-decisions)
    - [Formula versioning and freeze](#113-formula-versioning-and-freeze)
    - [Sample classification (Class A/B/C)](#114-sample-classification-class-abc)
    - [Sample lifecycle status](#115-sample-lifecycle-status)
    - [RSLN format](#116-rsln-format)
    - [Project ID format](#117-project-id-format)
    - [Material codes and COA status](#118-material-codes-and-coa-status)
12. [Status Badge Reference](#12-status-badge-reference)

---

## 1. App Overview

FormuLab is organized around two linked control systems that the QMS blueprint requires:

**Stage-gate engine** — Every project lives at a specific gate (G0 through G6). To advance, a gate decision must be formally recorded. This makes progression traceable and prevents skipping required evidence steps.

**Sample traceability engine (QP-245)** — Every physical sample lot produced during development is logged with a unique RSLN identifier, a class (A/B/C), a lifecycle status, storage condition, intended use, and a chain back to the formula version it was made from.

All data is stored locally in your browser (localStorage). There is no server or login. Data persists across sessions but is tied to the browser you use.

---

## 2. Navigation

The left sidebar has seven sections:

| Sidebar item | What it shows |
|---|---|
| **Dashboard** | Pipeline summary, stage-gate counts, recent activity, sample control stats |
| **Projects** | All projects with stage, priority, and version summary cards |
| **Formulations** | All formulations across all projects in a flat searchable list |
| **Samples** | All sample lots with RSLN, class, and lifecycle status |
| **Feedback** | All sensory feedback responses with radar chart and scores |
| **Materials** | Ingredient/material master with COA and qualification status |
| **Gate Reviews** | All gate decisions across all projects with pass-rate analytics |

The sidebar subtitle reads "R&D QMS Platform."

---

## 3. Dashboard

The Dashboard gives a real-time snapshot of the entire pipeline without needing to open individual projects.

### Stats row (8 cards)
- **Active Projects** — projects with status = Active
- **In Testing** — formulations currently in-testing status
- **Awaiting Feedback** — sample batches in in-review status
- **Avg Feedback Score** — mean overall score across all feedback (1–10)
- **Frozen Formulas** — formulations that have been locked at G4
- **Open Conditions** — gate reviews with a "GO with Conditions" decision and a condition due date
- **Projects on HOLD** — projects that have a HOLD gate decision recorded
- **Materials Pending COA** — materials where COA status is pending or received (not yet approved)

### Stage-Gate Pipeline
A seven-column grid showing how many active projects are at each gate (G0–G6). Each column also lists the project names as clickable links. Use this as the primary pipeline health view.

### Active Projects list
Shows each active project with its project code, current gate stage badge, priority badge, formula freeze status, latest gate decision, and latest formulation status. Click any row to go to the project detail.

### Formulation Status Pipeline
Shows how many formulations are in each status (Draft, In Testing, Approved, Rejected, Archived).

### Sample Control (QP-245)
Shows sample counts by class (A, B, C) and active RSLN count (lots not yet consumed, destroyed, or closed).

---

## 4. Projects

### Projects list page

The projects list shows all projects as cards in a two-column grid. Each card displays:
- Project code (PRJ-YYYY-###) and priority badge (top left)
- Current gate stage badge and formula freeze lock (top right)
- Project name, category, owner, CMO
- QTPP summary (if recorded)
- Version count, project status, and latest formulation status
- Average feedback score ring

**Filters:** Search by name, code, or category. Filter by project status (Active / On Hold / Completed) and by gate stage (G0–G6 buttons).

**Creating a new project:** Click **New Project** (top right). Fill in:
- Project Code — auto-generated as PRJ-YYYY-### but editable
- Project Name
- Category, Priority (Low / Medium / High / Critical), Starting Gate
- Owner and CMO (optional)
- QTPP — the Qualitative Target Product Profile (dosage form, serving size, target actives, sensory targets, shelf-life goal)
- Target Actives — list of key active ingredients and dose targets
- Shelf-Life Target — e.g. "12 months ambient"
- Target Sensory Profile — the qualitative sensory description to develop toward

### Project Detail page

Reached by clicking any project card. The header shows the project code, priority, name, status, formula freeze indicator, category, owner, CMO, and description.

The header has two action buttons:
- **Record Gate** (violet) — opens the gate decision modal pre-filled with the current stage
- **New Version** (indigo) — creates a new formulation version for this project

**Stage-Gate Progress bar** — A horizontal stepper showing all seven gates. Completed gates are green with a checkmark. The current gate is blue with the gate number. Future gates are grey. The last gate decision recorded at each gate is shown below its circle as a small status badge. You can override the stage manually by clicking "Override stage."

**Three tabs:**

**Formulations tab** — The formulation timeline, earliest version at top. Each card shows the version label, name, status (editable inline), parent version if it's a revision, change log note, label-impact warning, sample count, feedback count, and average score ring. From here you can View (full detail), Revise (clone to new version), Freeze (only at G4), or delete a formulation.

**Gate Reviews tab** — All gate decisions recorded for this project, sorted oldest first. Each card is color-coded by decision (green = GO, amber = GO with Conditions, red = HOLD, orange = RECYCLE). Conditions and their owners/due dates are shown inline. The **Record Gate Decision** button is also here.

**QTPP & Details tab** — Shows the QTPP, Target Actives, Shelf-Life Target, and Target Sensory Profile fields entered when the project was created.

---

## 5. Formulations

### Formulations list page

A flat list of all formulations across all projects, sorted newest first. Each row shows the version label badge, name, status badge, parent indicator (branch icon if it's a revision), project name, creation date, change log excerpt, and average feedback score.

**Filters:** Search by name, version label, or project. Filter by status (Draft / In Testing / Approved / Rejected / Archived).

Click any row to go to the formulation detail page.

### Formulation Detail page

Shows a full view of a single formulation version. The header shows the version label badge (violet if frozen, indigo otherwise), formulation name, status badge, and a "Frozen V1.0" pill if the formula is locked.

Below the header: creation date, creator, and a "Revised from vX.x" link if this is a revision. A change log box shows what changed in this version.

**Three tabs:**

**Ingredients tab** — Process notes and target profile displayed at top, then the full ingredient table showing name, supplier, amount, unit, percentage, and category.

**Samples tab** — All sample lots created from this formulation. Each shows batch code, class badge, lifecycle status badge, RSLN, quantity, storage condition, expiry, and recipients. The **Log Sample** button creates a new sample lot from this formulation.

**Feedback tab** — All feedback responses for this formulation. Shows a radar chart of average sensory attributes, a summary of common positives, issues, and suggestions, then individual feedback cards. The **Add Feedback** button opens the feedback modal.

---

## 6. Samples

### Samples list page

All sample lots across all projects, sorted by production date (newest first). Each row shows:
- Batch code and RSLN (in indigo monospace)
- Sample class badge (Class A / B / C)
- Lifecycle status badge
- Project and formulation version links
- Quantity, site, storage condition, expiry
- Intended use and classification flags (Ingestion possible / External distribution)
- Recipients with feedback status indicators

**Filters:** Search by batch code, RSLN, formulation name, or project name. Filter by class (A/B/C) and by legacy status.

**Lifecycle status dropdown** — Each row has an inline dropdown to update the lifecycle status directly without opening any modal. Changes are saved immediately.

**Creating a new sample lot:** Click **Log Sample** (top right). This is equivalent to creating a new sample from the formulation detail page, but lets you pick the project and formula version from a dropdown. Fields:
- Project and Formula Version
- Batch Code, Sample Class (A/B/C), Site
- Date Produced, Quantity, Unit
- Storage Condition and Expiry/Review Date
- Intended Use
- Notes
- Ingestion Possible and External Distribution checkboxes (a warning appears if ingestion is possible but class is not C)

The RSLN is auto-generated when the sample is saved using the format `RDS-YYMMDD-SITE-IN-SEQ`.

---

## 7. Feedback

### Feedback list page

All sensory feedback responses across all projects. The top row shows three summary cards: average overall score, count flagged for revision, and count of positive responses.

Below the summary: a radar chart of the overall sensory profile across all filtered feedback, and a scrollable list of individual feedback cards.

Each feedback card shows the reviewer name, role, project and formulation links, date, "Needs revision" badge if flagged, score ring, attribute bars, and the positives/negatives/suggestions text.

**Filters:** Search by reviewer name, formulation, or project. Filter by project using the dropdown.

**Recording feedback** is done from the Formulation Detail page → Feedback tab → **Add Feedback**, or from the Formulation Detail → Samples tab → **Add Feedback** button next to a specific sample.

**Feedback form fields:**
- Reviewer Name and Role (Internal Tester / Consumer Panel / Customer / Scientist / Manager / External Reviewer)
- Sample selector (if multiple samples exist for this formulation)
- Attribute sliders (1–10): Taste, Aroma, Appearance, Texture, Aftertaste, Overall
- What worked well (Positives)
- What didn't work (Negatives)
- Suggestions for next iteration
- Checkbox: Recommend reformulation before moving forward

---

## 8. Materials

The Materials page is the ingredient and raw material master. It covers COA tracking, R&D qualification, and commercial readiness.

### Materials table

Each row shows:
- Material name and MAT-#### code
- Notes (spec notes, allergen info)
- Category badge
- Supplier
- COA status with icon (clock = Pending, amber alert = Received, green check = Approved, red X = Rejected)
- R&D Approved indicator (green checkmark / grey X)
- Commercial Ready indicator

**Inline controls per row:**
- COA status dropdown — update directly
- **R&D** toggle button — click to approve/unapprove for R&D use
- **Comm.** toggle button — click to mark/unmark as commercial-ready
- Delete (trash icon)

**Filters:** Search by name, supplier, or material code. Filter by category dropdown. Filter by COA status buttons.

**Adding a material:** Click **Add Material**. Fields:
- Material Name and Supplier
- Category (Active/Botanical, Flavor, Sweetener, Acidulant, etc.)
- COA Status
- Notes (spec notes, allergen declarations, qualification info)
- R&D Approved and Commercial Ready checkboxes

The material code (MAT-####) is auto-assigned sequentially.

---

## 9. Gate Reviews

The Gate Reviews page is a cross-project view of all gate decisions recorded in the system.

### Summary cards
Shows total counts for GO, GO with Conditions, HOLD, and RECYCLE decisions across all projects.

### Gate Pass Rate by Stage
A table showing, for each gate (G0–G6): total number of reviews conducted at that gate, and the pass rate (GO + GO with Conditions as a percentage of all reviews at that gate).

### Gate Reviews list
All gate decisions, most recent first. Each card shows:
- Gate number and decision badge
- Project name (linked) and project code
- Review date and reviewers
- Evidence notes
- Condition box (if decision was "GO with Conditions") with condition owner and due date

**Filters:** Search, project dropdown, gate filter buttons (G0–G6), decision filter buttons.

Gate decisions can only be **created** from the Project Detail page. They cannot be edited after recording — only deleted.

---

## 10. Key Workflows

### 10.1 Starting a new project

1. Go to **Projects** in the sidebar.
2. Click **New Project**.
3. Assign a Project Code (default is auto-generated as PRJ-YYYY-### — edit if needed to match your numbering).
4. Fill in Name, Category, Priority, and Starting Gate (almost always G0 for a new idea).
5. Enter Owner (the person responsible for driving the project) and CMO if already known.
6. Write the QTPP — be specific: format, serving size, target actives with dose ranges, flavor/sensory direction, and shelf-life target. This becomes the North Star for all formulation decisions.
7. Fill in Target Actives and Shelf-Life Target as separate fields for easy reference.
8. Click **Create Project**.

After creation, open the project and record a G0 gate decision to formally document the intake triage.

---

### 10.2 Moving a project through gates

Each gate represents a controlled checkpoint. You record a gate decision to document that the evidence was reviewed and a decision was made. Only four decisions are allowed: GO, GO with Conditions, HOLD, RECYCLE.

**To record a gate decision:**
1. Open the project detail page.
2. Click **Record Gate** (violet button in the header) or go to the **Gate Reviews** tab and click **Record Gate Decision**.
3. Select the Gate (defaults to the project's current gate).
4. Select the Decision.
5. Fill in the actual review date and the reviewers present.
6. Write Evidence Notes summarizing what was reviewed and confirmed.
7. If the decision is **GO with Conditions**: fill in the Condition Description, Condition Owner, and Due Date in the panel that appears.
8. Click **Record Decision**.

**What happens automatically:**
- GO or GO with Conditions advances the project's current stage to the next gate.
- GO at G4 also sets the Formula Frozen flag on the project.

**To manually override the stage** (e.g., to correct an error): click "Override stage" on the stage stepper in the project detail, select the correct gate, and confirm. This does not create a gate review record.

---

### 10.3 Creating and revising formulations

**Creating the first version:**
1. Open the project detail page.
2. Click **New Version** or the **Create First Version** button in the empty formulation timeline.
3. Set the Version Label (use v0.1 for the first prototype — v0.x convention is for pre-freeze development).
4. Give it a descriptive name (e.g., "Initial Draft", "Reduced Sugar Honey").
5. Fill in the ingredients table: name, supplier, amount, unit, percentage, and category for each ingredient.
6. Add Process Notes (how it's made) and Target Profile (what this version is aiming for sensorially).
7. Write the What Changed field to document the formulation rationale.
8. Click **Create Formulation**.

**Revising an existing version:**
1. In the formulation timeline, find the version you want to branch from.
2. Click the **Revise** button (branch icon) on that card.
3. The new version is pre-filled with the parent version's ingredients, process notes, and target profile.
4. Edit the ingredients and notes as needed.
5. Crucially, fill in **What Changed** with a clear explanation of every change made and why.
6. If any ingredient change triggers a label modification (e.g., switching sweetener type), note it in **Label Impact**.
7. The version label auto-increments (v0.2, v0.3, etc.).
8. Click **Create Revision**.

Formulation history is immutable — old versions are never overwritten, only added to.

---

### 10.4 Freezing a formula at G4

Formula freeze is the G4 compliance lock. A frozen formula becomes V1.0, and post-freeze changes require formal documentation (the app will show a warning banner on any new version created after freeze).

**To freeze a formula:**

**Method 1 — Via gate decision (recommended):**
1. Record a G4 gate decision with decision = GO.
2. The system automatically sets the project's Formula Frozen flag.
3. The most recently approved/in-testing formulation should then be manually frozen using Method 2.

**Method 2 — Direct freeze button:**
1. Open the project detail page.
2. In the Formulations tab, find the version to freeze.
3. The **Freeze** button (lock icon, violet) appears on formulation cards when the project is at stage G4.
4. Click **Freeze**. The formulation status changes to Approved, the frozen flag is set, and the version label should be updated to v1.0 (you can edit the label before freezing if needed).

After freeze: the formulation card shows a purple lock icon and "Frozen" label. The version label badge turns violet. The project header shows "Formula Frozen."

---

### 10.5 Logging a sample lot

Sample lots can be logged from two places:

**From Formulation Detail → Samples tab → Log Sample** (links the sample directly to a specific formulation version).

**From the Samples page → Log Sample** (lets you select the project and formulation from dropdowns).

**Sample log fields:**
- **Batch Code** — your internal batch reference (e.g., ZCB-003)
- **Sample Class** — See the Class reference below. If ingestion is possible, set Class C.
- **Site** — where the sample was made or will be stored (ECS, STR, VZ, RI, ALF, External Lab)
- **Date Produced**
- **Quantity and Unit** (e.g., 30 bottles)
- **Storage Condition** — select the required storage condition (Ambient, Refrigerated, Frozen, etc.)
- **Expiry/Review Date** — the date QA must review the sample status by
- **Intended Use** — brief description of the planned use (e.g., "Internal sensory panel", "External lab analytical testing")
- **Ingestion Possible** — check if the sample will be tasted or consumed
- **External Distribution** — check if the sample will leave the building

The RSLN (R&D Sample Lot Number) is auto-generated when the sample is saved.

**After logging**, update the lifecycle status as the sample moves through its life using the inline dropdown on the Samples list page.

---

### 10.6 Recording sensory feedback

1. Go to the **Formulation Detail** page for the formulation being evaluated.
2. Make sure at least one sample lot has been logged under the **Samples** tab.
3. Click **Add Feedback** (from either the Feedback tab or the button next to a sample on the Samples tab).
4. Select the reviewer name and their role.
5. If more than one sample lot exists for this formulation, select the specific sample batch the feedback is for.
6. Use the sliders to rate each sensory attribute on a scale of 1–10: Taste, Aroma, Appearance, Texture, Aftertaste, and Overall.
7. Fill in What worked well, What didn't work, and Suggestions for next iteration.
8. Check **Recommend reformulation before moving forward** if the reviewer believes another revision is needed before any approval or external distribution.
9. Click **Submit Feedback**.

Feedback appears immediately in the Formulation Detail → Feedback tab. The radar chart updates to reflect the new average. The Dashboard and Project Detail average scores also update.

---

### 10.7 Managing materials and COA status

**Adding a new material:**
1. Go to **Materials** in the sidebar.
2. Click **Add Material**.
3. Enter the material name, supplier, category, and initial COA status.
4. Add notes for spec details, allergen declarations, or qualification notes.
5. Check R&D Approved if the material has been qualified for development use.
6. Check Commercial Ready if the supplier has been qualified for commercial-scale production.
7. Click **Add Material**. A MAT-#### code is auto-assigned.

**Updating COA status as documentation arrives:**
- On the Materials list, use the COA status dropdown in each row to move the material through: Pending → Received → Approved (or Rejected).
- No save button needed — changes apply immediately.

**Toggling R&D and Commercial qualification:**
- Click the **R&D** button on any row to toggle R&D Approved on/off (button turns green when approved).
- Click the **Comm.** button to toggle Commercial Ready on/off (button turns violet when ready).

**Important:** Materials in the materials master are reference data only — they are not currently linked automatically to ingredient entries in formulations. When formulating, reference material codes and COA status here, then enter the ingredients manually in the formulation. This linkage is an area for future platform development.

---

## 11. Data Concepts Reference

### 11.1 Stage Gates (G0–G6)

The stage-gate model controls project progression. A project cannot have gate records "skipped" — each gate should be formally reviewed in sequence. Only QA-authorized decisions advance the project.

| Gate | Name | Purpose |
|---|---|---|
| **G0** | Idea Intake & Triage | Convert the idea into a controlled project record. Assign Project ID, assess feasibility at high level, decide whether to proceed. |
| **G1** | Feasibility & Claims Guardrails | Define measurable product intent. Set QTPP, claims boundaries, preliminary CQAs (Critical Quality Attributes), and supply feasibility check. |
| **G2** | Design Inputs & Development Plan | Lock design inputs, specify analytical test plan, stability strategy, data-integrity plan. Prototype work is blocked until G2 is passed. |
| **G3** | Prototype Development & Downselect | Generate traceable prototype evidence. Document which candidate version is selected and why, linked to batch records and test results. |
| **G4** | Verification & Formulation Freeze | Create the compliance lock. Approve the formula spec package, clear label/claims with RA, initiate stability, create MMR-ready instructions. On GO, formula is frozen as V1.0. |
| **G5** | Tech Transfer & Pilot / Scale-Up | Move the frozen formula to the CMO. Prove the product can be made at scale. Capture pilot batch records and process parameter summaries. |
| **G6** | Launch Readiness & QMS Handoff | Final closeout. Commercial package complete, archive retrievable on demand, retention rules assigned, project moves to archived status. |

---

### 11.2 Gate Decisions

Four decisions are valid at any gate:

| Decision | Meaning |
|---|---|
| **GO** | Evidence reviewed and accepted. Project advances to next gate. |
| **GO with Conditions** | Project advances but one or more conditions must be formally closed. Requires: condition description, owner, and due date. |
| **HOLD** | Evidence insufficient or a blocking issue found. Downstream work is suspended until HOLD is lifted by a subsequent GO decision. |
| **RECYCLE** | Project returns to an earlier stage. Requires a documented return decision and impact assessment on previously generated evidence. |

---

### 11.3 Formula Versioning and Freeze

**Pre-freeze versions** use the v0.x naming convention (v0.1, v0.2, v0.3, etc.). These are development iterations — any number of revisions are permitted.

**The freeze** happens at G4 GO. The selected candidate becomes V1.0. After freeze:
- The formula is locked. The frozen card shows a purple lock icon.
- New formulation versions can still be created (for documentation purposes or post-freeze change control), but the app displays a warning banner: "Post-freeze changes should go through formal change control."
- The project header shows a "Formula Frozen" pill.

The freeze is a one-way operation within the app — it cannot be undone through the UI.

---

### 11.4 Sample Classification (Class A/B/C)

Per QP-245, every R&D sample lot must be classified before production. The class determines labeling requirements, approval rules, and distribution permissions.

| Class | Description | Key controls |
|---|---|---|
| **Class A** | Internal reference / non-ingestion material (analytical standards, visual reference units, packaging mock-ups) | Minimal label controls. No ingestion. Internal only. |
| **Class B** | Internal ingestion material (internal sensory panels, tasters inside the organization) | Requires label issuance and reconciliation. Second-person verification before release. |
| **Class C** | External distribution or any ingestion-possible sample that leaves controlled custody | Strictest controls. Allergen/ingredient/warning disclosure required. QA approval before any distribution. Class C is mandatory when ingestion is possible. |

**Rule:** If the **Ingestion Possible** checkbox is checked, the sample should be Class C. The app will display a warning if a non-C class is selected with ingestion checked.

---

### 11.5 Sample Lifecycle Status

The 15-state lifecycle covers a lot from request through final disposition:

| Status | Meaning |
|---|---|
| Requested | FRM-QP-245-01 submitted; sample not yet assigned an RSLN |
| Pending Assignment | Awaiting QA to assign RSLN and confirm classification |
| Assigned | RSLN assigned; awaiting label generation |
| Labeled | Labels generated and applied; pre-release state |
| Quarantine | Under QA hold — not approved for use or distribution |
| Released | QA has approved for intended use or distribution |
| In Storage | Physically stored at a controlled location |
| In Transit | En route to an external recipient (CoC initiated) |
| At Recipient | Delivered to external lab or consumer panel |
| At Review Date | The expiry/review date has been reached; pending QA decision |
| Extended | QA has approved an extension with a new review date |
| Consumed | Sample used up in testing or sensory evaluation (terminal state) |
| Returned | Returned from recipient; must go through receipt inspection before any reuse |
| Destroyed | Lot destroyed and documented (terminal state) |
| Closed | Archive state — record closed and retained per retention schedule (terminal state) |

Terminal states (Consumed, Destroyed, Closed) are counted as "inactive" RSLNs on the Dashboard.

---

### 11.6 RSLN Format

The R&D Sample Lot Number uniquely identifies a physical sample lot. The format is:

```
RDS - YYMMDD - SITE - TT - SEQ
```

| Segment | Meaning | Example |
|---|---|---|
| RDS | Fixed prefix for all R&D samples | RDS |
| YYMMDD | Date produced (2-digit year, month, day) | 260322 |
| SITE | Controlled site code | ECS, STR, VZ, RI, ALF |
| TT | Sample type code | IN (internal), EX (external) |
| SEQ | Sequential 3-digit lot number for that date | 001, 002, 003 |

**Example:** `RDS-260322-ECS-IN-002` = an internal sample lot produced on March 22, 2026 at ECS, second lot of the day.

The app auto-generates RSLNs using the current date and a random sequence. If you need a specific RSLN (e.g., to match a physical label already printed), you can update the RSLN field after logging by editing the sample directly in the store — this is an area for a future edit modal.

---

### 11.7 Project ID Format

```
PRJ - YYYY - ###
```

| Segment | Meaning | Example |
|---|---|---|
| PRJ | Fixed prefix | PRJ |
| YYYY | Year the project was initiated | 2026 |
| ### | Sequential 3-digit project number | 001, 002, 003 |

**Example:** `PRJ-2026-001` = first project initiated in 2026.

Project IDs are assigned when creating a new project. The app auto-suggests the next number but you can override it. Once assigned, a Project ID should not be changed — it is the anchor identifier for all linked formulations, samples, gate reviews, and material associations.

---

### 11.8 Material Codes and COA Status

**Material codes** use the format `MAT-####` (e.g., `MAT-0001`). These are auto-assigned sequentially and are used as the controlled identifier for each ingredient or raw material.

**COA Status** tracks where a material is in the documentation process:

| Status | Meaning |
|---|---|
| **Pending** | COA has not been received yet |
| **Received** | COA is in hand but has not been reviewed and approved by QA |
| **Approved** | COA reviewed and material cleared for use |
| **Rejected** | COA failed review or material is not acceptable |

**R&D Approved** — the material has been qualified for use in prototype development.

**Commercial Ready** — the supplier has been qualified for commercial-scale production. A material can be R&D Approved but not Commercial Ready (e.g., sourced from a small specialty supplier fine for lab work but not scalable).

---

## 12. Status Badge Reference

| Badge | Color | Where it appears |
|---|---|---|
| G0 — Intake | Grey | Project stage |
| G1 — Feasibility | Blue | Project stage |
| G2 — Design Inputs | Cyan | Project stage |
| G3 — Prototype | Violet | Project stage |
| G4 — Freeze | Amber | Project stage |
| G5 — Tech Transfer | Orange | Project stage |
| G6 — Launch Ready | Green | Project stage |
| GO | Green | Gate decision |
| GO w/ Conditions | Amber | Gate decision |
| HOLD | Red | Gate decision |
| RECYCLE | Orange | Gate decision |
| Draft | Grey | Formulation status |
| In Testing | Blue | Formulation status |
| Approved | Green | Formulation status |
| Rejected | Red | Formulation status |
| Archived | Grey | Formulation status |
| Active | Indigo | Project status |
| On Hold | Amber | Project status |
| Completed | Green | Project status |
| Class A | Grey | Sample classification |
| Class B | Blue | Sample classification |
| Class C | Orange | Sample classification |
| Low | Grey | Project priority |
| Medium | Blue | Project priority |
| High | Amber | Project priority |
| Critical | Red | Project priority |

---

*FormuLab — Vivazen R&D QMS Platform. Built April 2026.*
