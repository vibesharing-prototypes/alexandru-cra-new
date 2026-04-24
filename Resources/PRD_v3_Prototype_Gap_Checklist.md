# PRD v3 vs prototype — gap checklist

Compared to `Cyber_Risk_Management_PRD_v3.md` (Apr 2026). Each `- [ ]` item is a **gap**: not implemented, placeholder-only, or not meeting the PRD as written.

---

## Overview dashboard (§4.3, FR-01)

- [ ] 25×5 heat maps (Likelihood 1–25 × Impact 1–5) with counts per cell; prototype uses 5×5 banded likelihood × impact
- [ ] Side-by-side **Inherent** and **Residual** heat maps (or equivalent always-visible pair per PRD layout)
- [ ] Risk treatment status donut (mitigation plans: Open / In progress / Completed / Overdue)
- [ ] Working **Export cyber risk management overview** (full dashboard artifact)
- [ ] Per-widget **More options** → export PDF / PNG / XLSX
- [ ] Heat-map cell drill-down listing risks **in-cell** (navigate-to-register exists; in-place drill UX NFR)
- [ ] Org-unit filter on heat-map drill-down (BU filter exists for matrix data; wire to drill lists if required)

---

## Cyber risk assessments list (§4.2, FR-02)

- [ ] Status badge copy aligned to PRD (**In progress** vs internal `Scoring` label) if required for release
- [ ] Server-backed search / filter / pagination (prototype: in-memory grid only)

---

## Assessment — Details step (§4.1 Step 1, FR-03)

- [ ] Attachment **5 MB** cap and format enforcement (JPG, PDF, XLS per PRD)
- [ ] Persisted assessment metadata + attachments (prototype/local draft only)

---

## Assessment — Scope step (§4.1 Step 2, FR-04)

- [ ] **Warn** when scoped asset has **no linked controls** (residual-risk impact) (FR-04.9)
- [ ] Cyber risks / threats / vulns scope behaviour per PRD auto-select + unselect rules with backend rules

---

## Assessment — Scoring step (§4.1 Step 3, FR-05, AI-FR-02/03/05/06)

- [ ] **Per-field** persistent **“AI-suggested”** badge until edit or approval (not only page-level AI banner)
- [ ] **`confidence_flag`** (high/medium/low), low-confidence warning + **sort-to-top** queue
- [ ] Scenario **`n/a`** state, **required justification**, excluded from aggregation (FR-05.13)
- [ ] **Bulk approve** scenarios at cyber-risk level; block **Approve assessment** while any scenario remains **draft**
- [ ] **Immutable audit log** entries for all state transitions (who/when/old/new/AI vs human) (FR-05.16); extend beyond current history mock
- [ ] AI **offline banner** + **Retry**; no raw model errors (AI-FR-06)
- [ ] Async AI generation with **non-blocking** navigation + loading states per AI-NFR-01

---

## Assessment — Results step (§4.1 Step 4, FR-06)

- [ ] **Export results** PDF / XLSX with selectable scope (whole assessment / single cyber risk / single asset) (FR-06.8)

---

## Scoring rationale page (§4.1, FR-05.10–11, FR-00.4, AI-FR-03)

- [ ] **Tenant threat & vulnerability severity scale** reference text (FR-00.2–00.4) on page; not only generic swatches
- [ ] Rich text editor **toolbar actions** bound to real formatting model (prototype: decorative toolbar)
- [ ] Rationale structure **paragraphs/labels** per AI-FR-03.2a–f enforced by agent output

---

## Cyber risks register (§4.4, FR-07)

- [ ] Table columns: **Inherent** and **Residual** cyber risk scores (FR-07.1) alongside existing score column

---

## Threats library (§4.5, FR-08)

- [ ] **Read-only** enforcement for platform-provided threats; edit rules for user-defined only (FR-08.2)
- [ ] Backend/API for add/filter/search (prototype: local store)

---

## Vulnerabilities library (§4.6, FR-09)

- [ ] **Overview** tab content (charts/summary), not placeholder
- [ ] **Discrete assets**, **Findings**, **CVEs** tab grids and flows (currently placeholder copy)
- [ ] **Add vulnerabilities** CTA for user-defined categories (FR-09.4)
- [ ] **Tenable / Qualys** ingestion wired to product connectors (FR-09.6); import button is UI-only
- [ ] Platform-seeded **read-only** library rows (FR-09.3)

---

## Controls (§4.7, FR-10)

- [ ] Data from **both** OL and Projects with real linkage counts (FR-10.2) — prototype static mock rows

---

## Mitigation plans (§4.8, FR-11)

- [ ] Treatment **strategies**: mitigate / accept / avoid / transfer (FR-11.5)
- [ ] Create plan **pre-filled from scenario** (risk scenario–level link) (FR-11.4)
- [ ] **Email** on create and on **Overdue** (FR-11.8)
- [ ] Persisted create/update from side sheet + list (prototype: mock rows / local UI)

---

## Cyber risk settings (FR-00, §6.1)

- [ ] **Threat severity** and **vulnerability severity** 1–5 scale configuration UIs (FR-00.2–00.3), distinct from cyber score + likelihood bands
- [ ] **Scoring formulas** and **Aggregation** tabs — replace placeholders
- [ ] **RBAC**: settings restricted to IT Risk Manager / Admin (FR-00.6)
- [ ] Scale change rules: **no retroactive** change on Approved assessments (FR-00.5) — needs persistence model
- [ ] **AI Assessment agent** + **Classy** toggles (FR-007) when in scope

---

## AI — Classy document intake (AI-FR-07)

- [ ] Classy: structured summarise from uploads, accept/reject suggestions, tenant boundary, parse errors (all AI-FR-07.x)
- [ ] Classy file limits: PDF/DOCX/XLSX/TXT, **≤20 MB**, **≤10** files per assessment (vs Details 5 MB / fewer types in core FR-03.8)

---

## Navigation & IA (§3.1, §5)

- [ ] **File import** route exposed in left nav (currently commented in `Navigation.tsx`)
- [ ] Breadcrumb prefix **Asset Manager** consistent on all deep pages (spot-check vs PRD)

---

## Non-functional (§7 — prototype scope)

- [ ] RBAC for assessor / reviewer / risk owner / control owner / read-only (NFR-01.4)
- [ ] **Autosave** + survive session expiry (NFR-01.5)
- [ ] **Telemetry** events (lifecycle, AI accept/edit, exports, dashboard views) (NFR-01.14)
- [ ] **Audit log** UI + **export** (NFR-01.9–01.10)
- [ ] **WCAG 2.1 AA** + heat-map accessible data-table fallback (NFR-01.11)
- [ ] **i18n** beyond EN (NFR-01.12)
- [ ] Export footers: assessment ID, timestamp, user (NFR-01.10)
- [ ] Tenant-configurable **ID prefixes** (NFR-01.7)
- [ ] Performance targets (NFR-01.8) — not measured in prototype

---

## Integrations & GTM (§8–9)

- [ ] Production **Tenable / Qualys** connector UX in-module beyond stub pages
- [ ] **Entitlement** gating for Cyber Risk subscription (§3.1, §8.3)

---

*Document generated for engineering/design tracking; prototype path: `src/`.*
