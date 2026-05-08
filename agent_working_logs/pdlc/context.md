# PDLC Context: CRA Assessment Scenarios Fix

**Initiative:** Fix pre-scored scenarios in new CRA assessments  
**Status:** Planning Complete, Ready for Implementation  
**Last Updated:** 2026-05-08

---

## Problem Summary

When users create a new Cyber Risk Assessment and navigate to the Scoring tab, all scenarios display pre-filled scores (threat severity, vulnerability severity, likelihood, cyber risk score) inherited from the shared catalog. This breaks the intended workflow: scores should only appear **after** the user initiates AI scoring or manually scores each scenario.

**Root cause:** The assessment scoring tab directly references catalog scenarios, which are generated with deterministic baseline scores. The catalog scenarios are templates, not assessment-specific instances.

---

## Solution

Implement **assessment-scoped scenario instances**:
- New `AssessmentScenario` type with nullable score fields
- Scenarios created fresh for each assessment with unique IDs (`ASC-{assessmentId}-{seq}`)
- Only Impact pre-filled (from asset criticality)
- All other scores (`threatSeverity`, `vulnerabilitySeverity`, `likelihood`, `cyberRiskScore`) start as `null`
- Stored in the assessment draft, not in the shared catalog

This eliminates the need for masking flags and makes the data accurately represent "unscored."

---

## Documents

- **Discovery Brief:** [discovery/DISCOVERY-BRIEF.md](discovery/DISCOVERY-BRIEF.md)
- **Implementation Plan:** [planning/implementation-plan.md](planning/implementation-plan.md)
- **Handoff:** [handoffs/planning-to-implementation.md](handoffs/planning-to-implementation.md)
- **Quality Gates:** [quality-gates.md](quality-gates.md)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/data/scenarios.ts` | Catalog scenario generation (pre-scored templates) |
| `src/data/assessmentScopeRollup.ts` | Currently filters catalog scenarios by scope |
| `src/pages/AssessmentScoringTab.tsx` | Displays scenarios in data grid (currently uses catalog scenarios) |
| `src/data/craAssessmentDraftTypes.ts` | Assessment draft type definitions |
| `src/pages/craNewAssessmentDraftStorage.ts` | Draft persistence and state management |

**New file:** `src/data/assessmentScenarioBuilder.ts` — will contain `buildAssessmentScenarios()` function.

---

## Business Context

- **Product:** CRA (Cyber Risk Assessment) tool
- **Workflow:** Analysts create assessments, define scope (assets/risks), then score scenarios (manually or via AI)
- **Primary value:** Accurate, audit-ready cyber risk scoring
- **Current pain:** Pre-filled scores undermine trust and confuse users

---

## Technical Context

- **Stack:** React + TypeScript, MUI components
- **Data model:** Mock data (in-memory with localStorage persistence)
- **Persistence:** Managed by `catalogStore.ts` (debounced writes to IndexedDB/localStorage)
- **Catalog:** Global library of cyber risks, threats, vulnerabilities, assets, scenarios
- **Assessment draft:** Active assessment stored in `CraNewAssessmentPersistedDraft` type

---

## Implementation Status

**Current Phase:** G4 (Planning) — Complete  
**Next Phase:** G5 (Implementation)

**Tasks:**
1. ✅ Define `AssessmentScenario` type
2. ✅ Plan `buildAssessmentScenarios()` creation logic
3. ✅ Plan draft storage integration
4. ✅ Plan scoring tab refactor
5. ✅ Plan masking flag removal
6. ✅ Plan rationale page updates
7. ✅ Plan testing & verification

**Estimate:** ~7 hours

---

## Decisions Log

| Decision | Rationale |
|----------|-----------|
| **Use assessment-scoped instances (Option A) vs. score stripping (Option B) or improved masking (Option C)** | Option A cleanly separates templates (catalog) from instances (assessment), eliminates masking complexity, and enables multi-assessment support |
| **ID scheme: `ASC-{assessmentId}-{seq}`** | Avoids collision with catalog scenario IDs (`SC-{seq}`), clearly identifies assessment-specific scenarios |
| **Regenerate scenarios on scope changes (no score preservation in MVP)** | Simpler implementation for prototype; score preservation flagged as optional enhancement |
| **Remove masking flags entirely** | Data should accurately represent "unscored" rather than masking scores that exist |

---

## Risks & Mitigations

- **Scope change resets scores:** Mitigated by warning user; enhancement planned for score preservation
- **AI scoring integration:** Update AI scoring logic to target assessment scenario IDs (low impact — no real AI integration yet)
- **Performance with large assessments:** Profile with realistic data; add debouncing if needed

---

## Success Metrics

- [ ] New assessments show unscored scenarios (only Impact pre-filled)
- [ ] Manual scoring persists correctly
- [ ] Parent aggregation works when all applicable scenarios are scored
- [ ] Masking flags removed (grep confirms zero references)
- [ ] No TypeScript errors
- [ ] All test cases pass

---

## Next Actions

1. Execute Task 1: Define `AssessmentScenario` type in `craAssessmentDraftTypes.ts`
2. Execute remaining tasks sequentially (2-7)
3. Run end-to-end test suite
4. Deploy and smoke-test
5. Consider optional enhancements (score preservation, remove catalog baseline scores)

---

## Contact / Ownership

- **PM:** TBD
- **Engineer:** Implementation in progress
- **Stakeholders:** Risk analysts, CISO, auditors
