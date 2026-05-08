# Handoff: Planning → Implementation

**Date:** 2026-05-08  
**From:** Planning Phase  
**To:** Implementation Phase  
**Plan:** [implementation-plan.md](../planning/implementation-plan.md)

---

## Summary

This plan implements **assessment-scoped scenario instances** to fix the issue where new CRA assessments display pre-filled scores inherited from the catalog. The solution creates fresh scenario instances for each assessment with only Impact pre-populated (from asset criticality).

**Core change:** Replace direct references to catalog scenarios (which have deterministic scores) with assessment-specific `AssessmentScenario` instances that start unscored.

---

## Key Decisions

1. **New data type:** `AssessmentScenario` — similar to `MockScenario` but with nullable score fields and a `sourceCatalogScenarioId` reference.

2. **ID scheme:** `ASC-{assessmentId}-{seq}` — uniquely identifies scenarios within an assessment. No collision with catalog scenario IDs (`SC-{seq}`).

3. **Regeneration trigger:** Assessment scenarios regenerate when scope changes (assets added/removed, cyber risks excluded). Scores are **not** preserved on regeneration in the MVP; this is flagged as an optional enhancement.

4. **Storage:** Assessment scenarios stored in `CraNewAssessmentPersistedDraft.assessmentScenarios` array. Persisted to localStorage/IndexedDB alongside the draft.

5. **Masking flags removed:** The plan deletes `scenarioCatalogScoresReleased`, `scenarioManuallyRevealedScoreIds`, and `isNewCraDraftFlow` — no longer needed since the data accurately represents "unscored."

---

## Critical Path

**Tasks 1-3 are foundational** — define types, build creation logic, integrate with draft storage.  
**Task 4 is the biggest refactor** — update `AssessmentScoringTab` to consume assessment scenarios instead of catalog scenarios.  
**Tasks 5-6 are cleanup** — remove obsolete flags and update the rationale page.  
**Task 7 is verification** — end-to-end testing.

**Blocker:** Cannot proceed with Task 4 until Tasks 1-3 are complete (types must exist before scoring tab can consume them).

---

## Constraints

- **Prototype context:** This is a mock-data app — no production migration burden, acceptable to regenerate scenarios on scope changes without score preservation in the MVP.
- **Performance:** Regeneration happens synchronously on scope changes. Should be fast (<100ms) for typical assessments (10-50 scenarios), but profile with realistic data.
- **AI scoring integration:** Existing AI scoring code (if any) may assume catalog scenario IDs. Update to target assessment scenario IDs instead.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| **Scope change resets scores accidentally** | Medium | High | Warn user before regenerating; implement score preservation (enhancement) |
| **AI scoring breaks** | Low | Medium | Update AI scoring to use assessment scenario IDs |
| **Performance regression with large assessments** | Low | Medium | Profile and add debouncing if needed |
| **Rationale page breaks** | Low | High | Task 6 addresses this; thorough testing required |

---

## Open Questions

1. **Score preservation on scope changes:** Should we preserve scores when an asset is temporarily removed then re-added? Flagged as optional enhancement #1.
2. **Catalog scenario baseline scores:** Should we also update `scenarios.ts` to generate scenarios without baseline scores (nullify threat/vulnerability in the catalog)? Flagged as optional enhancement #2.
3. **AI scoring implementation:** Does the existing AI scoring code need updates? (Code doesn't appear to have real AI integration yet — placeholder logic only.)

---

## Testing Focus Areas

- **Unscored state:** Verify scenarios show "-" for null scores
- **Manual scoring:** Verify scores persist after saving on rationale page
- **Scope changes:** Verify scenarios regenerate correctly
- **Parent aggregation:** Verify aggregation only happens when all applicable scenarios are scored
- **Persistence:** Verify scores survive page refresh
- **No masking logic:** Verify flags are fully removed and no conditional masking remains

---

## Definition of Done

- [ ] All 7 tasks completed
- [ ] All test cases pass (Task 7)
- [ ] No TypeScript errors
- [ ] Masking flags fully removed (grep confirms)
- [ ] Code review approved
- [ ] Deployed and smoke-tested in dev environment

---

## Next Actions for Implementation

1. Start with Task 1 (define types)
2. Execute tasks sequentially (each depends on the previous)
3. Run end-to-end test suite after Task 7
4. Flag any discovered issues and decide whether to proceed with optional enhancements
