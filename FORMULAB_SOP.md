# FormuLab — Standard Operating Procedures

**Document:** FormuLab-SOP-001  
**Version:** 1.0  
**Effective Date:** April 2026  
**Scope:** All R&D team members using the FormuLab R&D QMS platform  
**Purpose:** Step-by-step procedures for all common tasks in the FormuLab platform

---

## Quick Reference — "Where do I go to…?"

| Task | Start here |
|---|---|
| Create a new project | Projects → New Project |
| Enter a new formula | Projects → [open project] → New Version |
| Revise an existing formula | Projects → [open project] → Revise (on the formula card) |
| Freeze a formula at G4 | Projects → [open project] → Freeze (on the formula card) |
| Record a gate decision | Projects → [open project] → Record Gate |
| Log a new sample lot | Samples → Log Sample  —or—  Formulations → [open formula] → Samples tab → Log Sample |
| Update a sample's status | Samples → find the lot → use the status dropdown inline |
| Submit sensory feedback | Formulations → [open formula] → Feedback tab → Add Feedback |
| Add or update a material | Materials → Add Material  —or—  use inline controls on any row |
| Update a COA status | Materials → find the material → use the COA dropdown inline |
| View a project's gate history | Projects → [open project] → Gate Reviews tab |
| View all gate decisions company-wide | Gate Reviews (sidebar) |
| Find a sample by RSLN or batch code | Samples → type RSLN or batch code in the search bar |
| View all feedback for a formula | Formulations → [open formula] → Feedback tab |
| View the overall pipeline | Dashboard |
| Print or generate sample/shipping labels | See SOP-009 below |

---

## SOP-001 — Create a New Development Project

**When to use:** A new product idea has been approved for development and needs a controlled project record.

**Steps:**

1. Click **Projects** in the left sidebar.
2. Click the **New Project** button (top right).
3. In the **Project Code** field, confirm or edit the auto-generated code. The format is `PRJ-YYYY-###` (e.g., `PRJ-2026-003`). Do not reuse codes from prior projects.
4. Enter the **Project Name** (e.g., "Zen Silver Shot").
5. Select the **Category** from the dropdown (e.g., Functional Beverage).
6. Set the **Priority**: Low / Medium / High / Critical. Use Critical for projects with active commercial commitments.
7. Set the **Starting Gate** to **G0** for all new projects.
8. Enter the **Owner** — the person responsible for driving the project forward.
9. Enter the **CMO** if a manufacturing partner has already been assigned (optional).
10. Write the **QTPP (Target Product Profile)**. Include: dosage format, serving size, target active ingredients with dose ranges, flavor/sensory direction, and shelf-life requirement. Example: *"Ready-to-drink 2oz shot. Relaxation stack: Ashwagandha KSM-66 300mg + Chamomile 200mg. Citrus-forward flavor. 12 months ambient shelf life."*
11. Enter **Target Actives** (list each ingredient and target dose separately for easy reference).
12. Enter the **Shelf-Life Target** (e.g., "12 months ambient").
13. Enter the **Target Sensory Profile** (the qualitative sensory description that defines success, e.g., "Light citrus, subtle floral, clean finish. No bitterness.").
14. Click **Create Project**.
15. Immediately after creating the project, record a G0 gate decision to document the triage. See **SOP-004**.

---

## SOP-002 — Enter a New Formula (First Version)

**When to use:** You are creating the first formulation for a project, or starting an entirely new formula line that is not a revision of an existing version.

**Steps:**

1. Click **Projects** in the left sidebar.
2. Click the project you are formulating for.
3. Click the **New Version** button (top right, indigo).
4. In the **Version Label** field, enter `v0.1` for the first prototype version. All pre-freeze versions use the `v0.x` naming convention.
5. Enter the **Formulation Name** — a short descriptive name for this version (e.g., "Initial Draft", "Low-Sugar Honey Variant").
6. In the **What Changed** field, describe the starting rationale. For a first version, describe what you are trying to achieve (e.g., "Initial formulation. Target: citrus-forward relaxation drink with ashwagandha at 300mg.").
7. If any ingredient in this formula will require a label change from a prior version, describe it in **Label Impact**. Leave blank if this is the first version.
8. In the **Ingredients** table, click **+ Add Row** for each ingredient and fill in:
   - Name (match the name in the Materials master if the ingredient is already registered)
   - Supplier
   - Amount and Unit (e.g., 300 mg, 15 mL, 40 g)
   - Percentage (optional, for weight/volume calculations)
   - Category (Active, Flavor, Sweetener, Acidulant, Base, etc.)
9. In **Process Notes**, describe how the formula is made — mixing sequence, temperature requirements, any critical process steps.
10. In **Target Profile**, describe what this specific version is intended to achieve sensorially or functionally (can be the same as the project's QTPP for v0.1).
11. Confirm **Created By** is your name.
12. Set **Initial Status** to **Draft**.
13. Click **Create Formulation**.

> **Note:** The formulation is now visible in the project's Formulation Timeline. The next step is typically to produce a sample batch and collect feedback. See **SOP-005** and **SOP-007**.

---

## SOP-003 — Revise an Existing Formula

**When to use:** Feedback has been collected on an existing version and changes need to be made, or a new iteration is required based on design decisions.

**Steps:**

1. Click **Projects** in the left sidebar.
2. Click the project containing the formula to be revised.
3. In the **Formulations** tab, find the version you are branching from.
4. Click the **Revise** button (branch icon) on that version's card. The new version form opens pre-filled with all ingredients, process notes, and target profile from the parent version.
5. The **Version Label** is auto-incremented (v0.2, v0.3, etc.). Adjust if needed.
6. Update the **Formulation Name** to reflect what changed (e.g., "Reduced Citric + More Chamomile").
7. **What Changed** is the most important field. Write a complete description of every change made and the reason for each change. Reference specific feedback or data that drove the decision. Example: *"Reduced citric acid from 2g to 1.5g — Sarah K. feedback noted excessive tartness (score 4/10 aftertaste). Increased chamomile extract from 200mg to 250mg — panel requested stronger floral note."*
8. Update the **Label Impact** field if any ingredient additions, removals, or supplier changes require a label update (e.g., adding a new allergen source, changing a sweetener type).
9. Edit ingredients as needed in the table (add rows, change amounts, remove rows).
10. Update **Process Notes** if the process has changed.
11. Click **Create Revision**.

> **Important:** Do not delete old formula versions. The full version history is the audit trail. All previous versions remain visible in the timeline.

---

## SOP-004 — Record a Gate Decision

**When to use:** A gate review meeting has occurred and a decision needs to be formally documented, or a gate decision is being recorded to advance the project.

**Steps:**

1. Click **Projects** in the left sidebar.
2. Click the project to record the gate decision for.
3. Click the **Record Gate** button (violet, in the header). The gate selection defaults to the project's current stage.
4. In the **Gate** dropdown, confirm the correct gate is selected (G0, G1, G2, etc.).
5. Select the **Decision**:
   - **GO** — evidence reviewed and accepted; project advances
   - **GO with Conditions** — project advances but conditions must be closed; proceed to step 6a
   - **HOLD** — blocking issue; downstream work suspended
   - **RECYCLE** — project returns to an earlier stage
6. Enter the **Actual Review Date** (the date the gate meeting or review occurred).
7. Enter the **Planned Date** if different from actual (optional, for tracking schedule adherence).
8. Enter all **Reviewers** present, separated by commas (e.g., "Jonathan, QA Lead, RA").
9. In **Evidence Notes**, summarize what was reviewed and confirmed. Be specific. Example: *"QTPP confirmed. Ashwagandha and chamomile regulatory review complete. Claims boundaries set. No prohibited ingredients identified."*
10. **If decision is GO with Conditions:** A condition panel appears. Fill in:
    - **Condition Description** — the specific deliverable required (e.g., "Stability protocol must be finalized before first external distribution.")
    - **Condition Owner** — the person responsible for closing the condition
    - **Condition Due Date**
11. Click **Record Decision**.

**What happens automatically:**
- GO or GO with Conditions: the project's current stage advances to the next gate.
- GO at G4: the project's Formula Frozen flag is set to true.

> **Note:** Gate records cannot be edited after saving. To correct a mistake, delete the record (trash icon in the Gate Reviews tab) and re-enter it correctly.

---

## SOP-005 — Log a New Sample Lot

**When to use:** A physical sample batch has been or is being produced and needs to be entered into the sample control system.

**Steps:**

1. Click **Samples** in the left sidebar (or navigate to the Formulation Detail page → Samples tab if logging directly against a known formula version).
2. Click **Log Sample**.
3. Select the **Project** from the dropdown.
4. Select the **Formula Version** the sample was made from.
5. Enter the **Batch Code** — your internal production batch reference (e.g., ZCB-003).
6. Select the **Sample Class**:
   - **Class A** — internal, non-ingestion (analytical standard, visual reference, packaging mock-up)
   - **Class B** — internal ingestion only (internal sensory panel)
   - **Class C** — external distribution or any sample where ingestion is possible outside the organization
7. Select the **Site** where the sample was produced or will be stored.
8. Enter the **Date Produced**.
9. Enter the **Quantity** and **Unit** (e.g., 30 bottles, 12 pouches).
10. Select the **Storage Condition** required for this lot (Ambient, Refrigerated 2–8°C, Frozen, etc.).
11. Enter the **Expiry / Review Date** — the date by which QA must review and either extend, retest, or disposition the lot.
12. Enter the **Intended Use** — a plain-language description (e.g., "Internal sensory panel — no external distribution", "External lab analytical testing", "Consumer focus group").
13. Add any relevant **Notes** about the batch.
14. Check **Ingestion Possible** if the sample will be tasted or consumed by anyone.
15. Check **External Distribution** if the sample will be sent outside the organization.

    > **Warning:** If Ingestion Possible is checked and the class is not C, the app will display a warning. Per QP-245, ingestion-possible samples must be Class C.

16. Click **Log Sample**. The RSLN is auto-generated and assigned to the record.

**After logging:**
- Update the lifecycle status as the sample moves through its life. See **SOP-006**.

---

## SOP-006 — Update a Sample's Lifecycle Status

**When to use:** A sample lot's physical status has changed (e.g., it has been released by QA, shipped, received at a lab, consumed, or destroyed).

**Steps:**

1. Click **Samples** in the left sidebar.
2. Find the sample lot using the search bar (search by batch code, RSLN, formulation name, or project name).
3. In the sample's row, find the **lifecycle status dropdown** on the right side of the card.
4. Select the new status from the dropdown. Changes save immediately — no save button needed.

**Common status transitions:**

| Event | Set status to |
|---|---|
| QA has assigned RSLN and labels are being prepared | Assigned |
| Labels have been printed and applied | Labeled |
| Lot placed under QA hold | Quarantine |
| QA has cleared the lot for use | Released |
| Lot moved to storage | In Storage |
| Lot shipped to external lab or CMO | In Transit |
| Lot confirmed received at external recipient | At Recipient |
| Expiry or review date reached | At Review Date |
| QA approved an extension with new review date | Extended |
| Lot has been fully used in testing | Consumed |
| Lot physically destroyed and documented | Destroyed |
| Record closed and archived | Closed |

> **Note:** Consumed, Destroyed, and Closed are terminal states. A returned lot must not be set directly to Released — it should go to Returned, then through receipt inspection before any re-use.

---

## SOP-007 — Submit Sensory Feedback

**When to use:** A tasting or evaluation session has been completed and sensory scores and notes need to be recorded against a specific formula version and sample lot.

**Steps:**

1. Click **Formulations** in the left sidebar.
2. Click the formulation version the sample was made from.
3. Click the **Feedback** tab.
4. Click **Add Feedback**.
5. Enter the **Reviewer Name**.
6. Select the reviewer's **Role** from the dropdown: Internal Tester, Consumer Panel, Customer, Scientist, Manager, External Reviewer.
7. If more than one sample lot exists for this formulation, the **Sample** dropdown appears — select the specific lot that was evaluated.
8. Use the **sliders** to score each attribute on a scale of **1 (poor) to 10 (excellent)**:
   - **Taste** — overall flavor quality
   - **Aroma** — smell before and after consumption
   - **Appearance** — color, clarity, visual appeal
   - **Texture** — mouthfeel, viscosity, carbonation if applicable
   - **Aftertaste** — the finish after swallowing
   - **Overall** — the reviewer's holistic score
9. In **What worked well**, record specific positives. Be as specific as possible (e.g., "Honey sweetness is natural and rounds out the citrus well" rather than "Tastes good").
10. In **What didn't work**, record specific issues (e.g., "Aftertaste is harsh and metallic — possibly the citric acid level").
11. In **Suggestions for next iteration**, record any specific changes the reviewer would want to see.
12. If the reviewer believes another revision is required before any approval or distribution decision, check **Recommend reformulation before moving forward**.
13. Click **Submit Feedback**.

The feedback appears immediately in the Feedback tab. The radar chart and average score ring update automatically.

---

## SOP-008 — Add or Update a Material in the Materials Master

**When to use:** A new ingredient or raw material is being introduced to the program, or an existing material's COA or qualification status has changed.

### Adding a new material

1. Click **Materials** in the left sidebar.
2. Click **Add Material**.
3. Enter the **Material Name** — use the supplier's exact specification name for traceability (e.g., "Ashwagandha Extract KSM-66" not just "Ashwagandha").
4. Enter the **Supplier** name.
5. Select the **Category** (Active/Botanical, Flavor, Sweetener, Acidulant, Base, etc.).
6. Set the initial **COA Status**:
   - Pending — COA not yet received
   - Received — COA in hand but not yet reviewed
   - Approved — COA reviewed and accepted
   - Rejected — COA reviewed and not acceptable
7. In **Notes**, record any relevant information: specification details, allergen declarations, grade (e.g., food grade, USP), standardization level (e.g., "min. 5% withanolides"), or qualification notes.
8. Check **R&D Approved** if the material has been reviewed and cleared for use in prototype development.
9. Check **Commercial Ready** if the supplier has been qualified for commercial-scale production. A material can be R&D Approved but not yet Commercial Ready.
10. Click **Add Material**. A material code (`MAT-####`) is auto-assigned.

### Updating an existing material

**To update COA status:**
1. Click **Materials** in the left sidebar.
2. Find the material (use the search bar or category/COA filters).
3. In the material's row, use the **COA status dropdown** to update to the new status. Saves immediately.

**To toggle R&D Approved:**
1. Find the material row.
2. Click the **R&D** button. It turns green when approved, grey when not. Saves immediately.

**To toggle Commercial Ready:**
1. Find the material row.
2. Click the **Comm.** button. It turns violet when ready, grey when not. Saves immediately.

---

## SOP-009 — Sample and Shipping Labels

### Current platform status

FormuLab does not currently generate printable sample labels or shipping documents. Label generation (LBL-QP-245-01/02/03/04 templates) and Chain of Custody / Transfer Records (FRM-QP-245-06/07) are identified in the QMS blueprint as future platform components.

### What to do in the current state

**For sample labels (LBL-QP-245-01/02):**
1. Log the sample lot in FormuLab per **SOP-005** to obtain the auto-generated RSLN.
2. Note the RSLN from the Samples page (displayed in indigo monospace under the batch code).
3. Use the RSLN, batch code, formula version, production date, expiry/review date, storage condition, site, and class to populate the physical label template manually (Word/Excel template).
4. Required label fields per class:
   - **Class A:** RSLN, product/formula name, production date, storage condition, "NOT FOR SALE"
   - **Class B:** All Class A fields + expiry/review date, intended use, "FOR INTERNAL USE ONLY — NOT FOR RESALE"
   - **Class C:** All Class B fields + ingredient listing, allergen declaration, net contents, "R&D SAMPLE — NOT FOR SALE"

**For shipping / chain of custody:**
1. Record the sample lot status as **In Transit** in FormuLab per **SOP-006** when the lot ships.
2. Prepare the Chain of Custody record (FRM-QP-245-06) using the current Word/Excel template.
3. Reference the RSLN and batch code from FormuLab on the CoC document for traceability linkage.
4. When the shipment is confirmed received, update the sample status to **At Recipient** per **SOP-006**.

> This workflow bridges FormuLab's current traceability record with your existing paper/Office-based label and CoC documents. When label generation is built into the platform, the RSLN and all required fields will be auto-populated from the sample record.

---

## SOP-010 — Find a Sample, Formula, or Project

### Find a sample by RSLN or batch code

1. Click **Samples** in the left sidebar.
2. Type the RSLN (e.g., `RDS-260322`) or batch code (e.g., `ZCB-002`) into the search bar.
3. The list filters in real time. Click into the linked formulation or project from the sample row.

### Find a formula version

1. Click **Formulations** in the left sidebar.
2. Type the formula name, version label (e.g., `v0.2`), or project name into the search bar.
3. Use the status filter buttons to narrow by Draft / In Testing / Approved / Rejected / Archived.
4. Click any row to open the full formulation detail.

### Find a project

1. Click **Projects** in the left sidebar.
2. Type the project name, project code (e.g., `PRJ-2026-001`), or category into the search bar.
3. Use the status filter buttons (Active / On Hold / Completed) and gate filter buttons (G0–G6) to narrow results.

### Find a gate decision

1. Click **Gate Reviews** in the left sidebar.
2. Use the project dropdown, gate filter buttons, or decision filter buttons to narrow the list.
3. Or open the specific project → **Gate Reviews** tab to see only that project's history.

---

## SOP-011 — View the Pipeline and Compliance Status

**When to use:** Management review, QA audit preparation, checking which projects are overdue for a gate decision, or identifying open conditions.

**Steps:**

1. Click **Dashboard** in the left sidebar.
2. **Stage-Gate Pipeline** section (second row) shows the count of projects at each gate. Click any project name to go directly to that project.
3. **Stats row** (top) shows:
   - Open Conditions — projects with a "GO with Conditions" decision that have an outstanding condition. Click into Gate Reviews to see condition details and due dates.
   - Projects on HOLD — projects where the most recent gate decision was HOLD.
   - Materials Pending COA — materials that are not yet COA-approved.
   - Frozen Formulas — formulas locked at G4.
4. For a full gate history across all projects, click **Gate Reviews** in the sidebar. The **Gate Pass Rate by Stage** table shows pass rates per gate — a low pass rate at a specific gate may indicate systemic evidence gaps.
5. For materials readiness, click **Materials** in the sidebar. Use the COA filter to show only Pending or Received materials — these need follow-up before moving projects toward G4 or G5.

---

## SOP-012 — Correct or Delete a Record

### Delete a gate review record

1. Open the project → **Gate Reviews** tab.
2. Find the incorrect record.
3. Click the trash icon (right side of the card).
4. Re-enter the corrected record per **SOP-004**.

> Gate records should only be deleted to correct data entry errors. Do not delete gate records to revise a decision — a new gate review record is the correct way to document a decision change.

### Delete a formulation version

1. Open the project → **Formulations** tab.
2. Find the version card.
3. Click the trash icon on the right side of the card.

> Do not delete formulation versions that have associated samples or feedback unless you are certain the records are test/error entries. Deleting a formulation also deletes all linked samples and feedback.

### Delete a project

1. Open the project detail page.
2. Click the trash icon button in the header area (top right).
3. Confirm deletion in the dialog.

> Deleting a project permanently removes all linked formulations, samples, feedback, and gate reviews. This cannot be undone.

### Delete a sample lot

1. (Not available from the Samples list page — deletion is only available from the Formulation Detail → Samples tab.)
2. Navigate to the formulation the sample is linked to.
3. Open the **Samples** tab.
4. Click the trash icon on the sample card.

### Delete a material

1. Click **Materials** in the left sidebar.
2. Find the material row.
3. Click the trash icon on the right side of the row.

---

## SOP-013 — Freeze a Formula at Gate 4

**When to use:** G4 gate review has been completed with a GO decision and the selected candidate formula is being locked as V1.0. This is the compliance lock — post-freeze changes require formal change control documentation.

**Steps:**

1. Confirm the project is at **G4** stage (check the stage stepper on the project detail page).
2. If you have not already done so, record a G4 gate decision per **SOP-004**. Selecting GO at G4 automatically sets the project's Formula Frozen flag.
3. Open the project → **Formulations** tab.
4. Identify the candidate formula version to freeze (typically the version currently in-testing or approved that passed the G4 review).
5. If needed, update the **Version Label** to `v1.0` before freezing (click Revise to open an edit, or update the label on the version). The label should reflect V1.0 to clearly distinguish the frozen baseline.
6. Click the **Freeze** button (lock icon, violet) on the formula card.
   > The Freeze button only appears when the project is at stage G4.
7. The formulation card turns violet with a lock icon and "Frozen" label. The status is set to Approved.
8. The project header now shows the "Formula Frozen" pill.

**After freeze:**
- Any new formulation version created for this project will display a warning: *"Post-freeze changes should go through formal change control. Document rationale carefully."*
- New post-freeze versions should be labeled as `v1.1`, `v1.2`, etc., and should reference the change control rationale in the What Changed field.

---

## Record Retention and Data Management

**Storage:** All FormuLab data is stored in your browser's localStorage under the key `formulab-store`. Data persists across sessions on the same browser and device but is not backed up to a server.

**Backup:** Periodically export your browser's localStorage or take screenshots of key records for backup. A formal export feature is a planned platform enhancement.

**Clearing data:** Do not clear browser data or site data for the FormuLab URL — this will permanently delete all project records.

**Shared access:** Because data is browser-local, multiple team members must each maintain their own records or access FormuLab from a single shared machine. A server-based multi-user version is a planned enhancement.

---

*FormuLab SOP-001 | Vivazen R&D QMS Platform | Version 1.0 | April 2026*  
*For questions about this document contact the R&D platform owner.*
