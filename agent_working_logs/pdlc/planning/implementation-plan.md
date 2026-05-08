# Implementation Plan: Assessment-Scoped Scenario Instances

**Based on:** [Discovery Brief](../discovery/DISCOVERY-BRIEF.md)  
**Solution:** Option A — Assessment-Scoped Scenario Instances  
**Goal:** Remove pre-filled scores from new CRA assessments; create assessment-specific scenario instances with only Impact pre-populated.

---

## Overview

This plan implements assessment-scoped scenario instances that are created fresh for each new CRA assessment, with scores initially null except for Impact (derived from asset criticality). This replaces the current approach of referencing pre-scored catalog scenarios and masking their scores with conditional flags.

**Key changes:**
1. New `AssessmentScenario` data type
2. Creation logic triggered when assessment scope is finalized
3. Update `AssessmentScoringTab` to consume assessment scenarios
4. Persist assessment scenarios in the draft
5. Remove masking flags (`scenarioCatalogScoresReleased`, `scenarioManuallyRevealedScoreIds`, `isNewCraDraftFlow`)

---

## Dependencies Map

```
Task 1 (types) 
  ↓
Task 2 (creation logic)
  ↓
Task 3 (draft storage)
  ↓  
Task 4 (scoring tab refactor)
  ↓
Task 5 (cleanup masking flags)
  ↓
Task 6 (rationale page updates)
  ↓
Task 7 (testing & verification)
```

---

## Task 1: Define AssessmentScenario Data Type

**File:** `src/data/craAssessmentDraftTypes.ts`

**What:** Create the `AssessmentScenario` type that represents a scenario instance within an assessment.

**Implementation:**

```typescript
/**
 * Assessment-scoped scenario instance created when an assessment is started.
 * Derived from a catalog scenario but has independent scoring lifecycle.
 */
export type AssessmentScenario = {
  /** Unique ID for this assessment scenario (format: "ASC-{assessmentId}-{seq}") */
  id: string;
  
  /** Reference back to the catalog scenario this was derived from */
  sourceCatalogScenarioId: string;
  
  /** Display name (copied from catalog scenario at creation time) */
  name: string;
  
  /** Owner ID (copied from catalog scenario's asset owner) */
  ownerId: string;
  
  /** Cyber risk this scenario belongs to */
  cyberRiskId: string;
  
  /** Asset being assessed */
  assetId: string;
  
  /** Impact score (pre-filled from asset criticality) */
  impact: FivePointScaleValue;
  impactLabel: FivePointScaleLabel;
  
  /** Threat severity (initially null, scored during assessment) */
  threatSeverity: FivePointScaleValue | null;
  threatSeverityLabel: FivePointScaleLabel | null;
  
  /** Vulnerability severity (initially null, scored during assessment) */
  vulnerabilitySeverity: FivePointScaleValue | null;
  vulnerabilitySeverityLabel: FivePointScaleLabel | null;
  
  /** Likelihood (derived: threat × vulnerability, initially null) */
  likelihood: number | null;
  likelihoodLabel: FivePointScaleLabel | null;
  
  /** Cyber risk score (derived: impact × likelihood, initially null) */
  cyberRiskScore: number | null;
  cyberRiskScoreLabel: FivePointScaleLabel | null;
  
  /** Threat IDs linked to this scenario */
  threatIds: string[];
  
  /** Vulnerability IDs linked to this scenario */
  vulnerabilityIds: string[];
  
  /** Scoring rationale text (copied from catalog scenario, can be edited) */
  scoringRationale: string;
  
  /** Relationships (control IDs, mitigation plan IDs) */
  relationships: {
    cyberRiskId: string;
    assetId: string;
    threatIds: string[];
    vulnerabilityIds: string[];
    controlIds: string[];
    mitigationPlanIds: string[];
  };
};
```

**Also add to `CraNewAssessmentPersistedDraft`:**

```typescript
export type CraNewAssessmentPersistedDraft = {
  // ... existing fields ...
  
  /**
   * Assessment-scoped scenario instances created for this assessment.
   * These are derived from catalog scenarios but have independent scoring lifecycle.
   * Created when assessment scope is finalized.
   */
  assessmentScenarios?: AssessmentScenario[];
};
```

**Verification:**
- [ ] Type compiles without errors
- [ ] Exported from `craAssessmentDraftTypes.ts`
- [ ] Imported successfully in other files (smoke test)

**Estimate:** 30 minutes

---

## Task 2: Create Assessment Scenario Generation Logic

**File:** `src/data/assessmentScenarioBuilder.ts` (new file)

**What:** Function to generate fresh assessment scenarios from catalog scenarios when an assessment is started.

**Implementation:**

```typescript
import { scenarios as catalogScenarios } from "./scenarios.js";
import { assets } from "./assets.js";
import { getFivePointLabel } from "./types.js";
import type { AssessmentScenario } from "./craAssessmentDraftTypes.js";
import type { FivePointScaleValue } from "./types.js";

/**
 * Build assessment-scoped scenario instances from catalog scenarios.
 * Only includes scenarios whose assets are in `includedAssetIds` and whose
 * cyber risks are NOT in `excludedCyberRiskIds`.
 * 
 * Each assessment scenario gets:
 * - A new unique ID (ASC-{assessmentId}-{seq})
 * - Impact pre-filled from asset criticality
 * - All other scores set to null (unscored)
 * - A reference back to the source catalog scenario
 */
export function buildAssessmentScenarios(
  assessmentId: string,
  includedAssetIds: Set<string>,
  excludedCyberRiskIds: Set<string>,
  excludedScenarioIds: ReadonlySet<string> = new Set(),
): AssessmentScenario[] {
  const assetById = new Map(assets.map((a) => [a.id, a]));
  
  const filteredCatalogScenarios = catalogScenarios.filter((s) => {
    if (!includedAssetIds.has(s.assetId)) return false;
    if (excludedCyberRiskIds.has(s.cyberRiskId)) return false;
    if (excludedScenarioIds.has(s.id)) return false;
    return true;
  });
  
  const result: AssessmentScenario[] = [];
  let seq = 0;
  
  for (const catalogScenario of filteredCatalogScenarios) {
    seq += 1;
    const asset = assetById.get(catalogScenario.assetId);
    if (!asset) continue; // Should not happen if catalog is consistent
    
    const impact = asset.criticality;
    const impactLabel = getFivePointLabel(impact as FivePointScaleValue);
    
    result.push({
      id: `ASC-${assessmentId}-${String(seq).padStart(3, "0")}`,
      sourceCatalogScenarioId: catalogScenario.id,
      name: catalogScenario.name,
      ownerId: catalogScenario.ownerId,
      cyberRiskId: catalogScenario.cyberRiskId,
      assetId: catalogScenario.assetId,
      impact,
      impactLabel,
      threatSeverity: null,
      threatSeverityLabel: null,
      vulnerabilitySeverity: null,
      vulnerabilitySeverityLabel: null,
      likelihood: null,
      likelihoodLabel: null,
      cyberRiskScore: null,
      cyberRiskScoreLabel: null,
      threatIds: [...catalogScenario.threatIds],
      vulnerabilityIds: [...catalogScenario.vulnerabilityIds],
      scoringRationale: catalogScenario.scoringRationale,
      relationships: {
        cyberRiskId: catalogScenario.relationships.cyberRiskId,
        assetId: catalogScenario.relationships.assetId,
        threatIds: [...catalogScenario.relationships.threatIds],
        vulnerabilityIds: [...catalogScenario.relationships.vulnerabilityIds],
        controlIds: [...catalogScenario.relationships.controlIds],
        mitigationPlanIds: [...catalogScenario.relationships.mitigationPlanIds],
      },
    });
  }
  
  return result;
}
```

**Verification:**
- [ ] Function creates scenarios with unique `ASC-{id}-{seq}` IDs
- [ ] Impact is correctly copied from asset criticality
- [ ] All score fields (threat, vulnerability, likelihood, cyberRiskScore) are `null`
- [ ] Filtering by included assets and excluded cyber risks works
- [ ] Relationships are preserved from catalog scenario

**Estimate:** 45 minutes

---

## Task 3: Integrate Assessment Scenario Creation into Draft Storage

**File:** `src/pages/craNewAssessmentDraftStorage.ts`

**What:** Call `buildAssessmentScenarios()` when the assessment scope is finalized (e.g., when moving to Scoring tab or when scope changes).

**Changes:**

1. Import the builder:
```typescript
import { buildAssessmentScenarios } from "../data/assessmentScenarioBuilder.js";
```

2. Add helper to regenerate assessment scenarios:
```typescript
/**
 * Regenerate assessment scenarios based on current scope.
 * Called when scope changes (assets added/removed, risks excluded) or when first entering scoring.
 */
function regenerateAssessmentScenarios(draft: CraNewAssessmentPersistedDraft): void {
  const assessmentId = draft.assessmentId;
  const includedAssetIds = draft.includedScopeAssetIds;
  const excludedCyberRiskIds = draft.excludedScopeCyberRiskIds ?? new Set();
  const excludedScenarioIds = draft.excludedScopeScenarioIds ?? new Set();
  
  const newAssessmentScenarios = buildAssessmentScenarios(
    assessmentId,
    includedAssetIds,
    excludedCyberRiskIds,
    excludedScenarioIds,
  );
  
  draft.assessmentScenarios = newAssessmentScenarios;
}
```

3. Update `setDraft()` to trigger regeneration on scope changes:
```typescript
export function setDraft(updates: Partial<CraNewAssessmentPersistedDraft>): void {
  const prev = { ...activeDraft };
  Object.assign(activeDraft, updates);
  
  // Regenerate assessment scenarios if scope changed
  const scopeChanged =
    updates.includedScopeAssetIds !== undefined ||
    updates.excludedScopeCyberRiskIds !== undefined ||
    updates.excludedScopeScenarioIds !== undefined;
  
  if (scopeChanged) {
    regenerateAssessmentScenarios(activeDraft);
  }
  
  markCatalogDirty();
  notifySubscribers();
}
```

4. Update `initializeDraft()` to create initial assessment scenarios:
```typescript
export function initializeDraft(assessmentId: string): void {
  activeDraft = {
    assessmentId,
    // ... other defaults ...
    assessmentScenarios: [], // Will be populated when scope is set
  };
  notifySubscribers();
}
```

**Verification:**
- [ ] Assessment scenarios are created when scope is first set
- [ ] Assessment scenarios regenerate when assets are added/removed
- [ ] Assessment scenarios regenerate when cyber risks are excluded
- [ ] Existing scores are preserved if IDs match (stretch: implement score preservation logic)

**Estimate:** 1 hour

---

## Task 4: Update AssessmentScoringTab to Use Assessment Scenarios

**File:** `src/pages/AssessmentScoringTab.tsx`

**What:** Refactor `buildScoringRowsForScope()` to consume `assessmentScenarios` from the draft instead of calling `assessmentScopedScenarios()` (which returns catalog scenarios).

**Changes:**

1. Update component props to receive `assessmentScenarios`:
```typescript
type AssessmentScoringTabProps = {
  // ... existing props ...
  
  /** Assessment-scoped scenario instances (replace catalog scenario references) */
  assessmentScenarios: AssessmentScenario[];
  
  // REMOVE these props (no longer needed):
  // - scenarioCatalogScoresReleased
  // - scenarioManuallyRevealedScoreIds
  // - scenarioNavCatalogScoresReleased
  // - scenarioNavManuallyRevealedScoreIds
  // - isNewCraDraftFlow
};
```

2. Replace `buildScoringRowsForScope()` implementation:
```typescript
function buildScoringRowsForScope(
  assessmentScenarios: AssessmentScenario[],
  scenarioNotApplicableIds: ReadonlySet<string> = EMPTY_SCENARIO_NOT_APPLICABLE_IDS,
): ScoringRow[] {
  if (assessmentScenarios.length === 0) return [];
  
  // Group scenarios by cyber risk
  const byRisk = new Map<string, AssessmentScenario[]>();
  for (const s of assessmentScenarios) {
    const list = byRisk.get(s.cyberRiskId) ?? [];
    list.push(s);
    byRisk.set(s.cyberRiskId, list);
  }
  
  // Get unique cyber risks (in order of first appearance)
  const riskIds = [...new Set(assessmentScenarios.map((s) => s.cyberRiskId))];
  const risks = riskIds.map((id) => cyberRisks.find((r) => r.id === id)).filter(Boolean);
  
  return risks.flatMap((cr) => {
    const riskRow: ScoringRow = {
      id: cr.id,
      kind: "cyberRisk",
      groupId: cr.id,
      tag: "Cyber risk",
      title: (
        <Link
          href="#"
          onClick={(e) => e.preventDefault()}
          underline="always"
          sx={({ tokens: t }) => ({
            fontSize: t.semantic.font.text.md.fontSize.value,
            lineHeight: t.semantic.font.text.md.lineHeight.value,
            letterSpacing: t.semantic.font.text.md.letterSpacing.value,
            fontWeight: 600,
            color: t.semantic.color.type.default.value,
          })}
        >
          {cr.name}
        </Link>
      ),
      impact: null,
      threat: null,
      vulnerability: null,
      likelihood: null,
      cyberRiskScore: null,
    };
    
    const relatedScenarios = byRisk.get(cr.id) ?? [];
    const scenarioRows: ScoringRow[] = relatedScenarios.map((s) => {
      const na = scenarioNotApplicableIds.has(s.id);
      return {
        id: s.id,
        kind: "scenario" as const,
        groupId: cr.id,
        tag: "Scenario",
        title: (
          <Typography
            sx={({ tokens: t }) => ({
              fontSize: t.semantic.font.text.md.fontSize.value,
              lineHeight: t.semantic.font.text.md.lineHeight.value,
              letterSpacing: t.semantic.font.text.md.letterSpacing.value,
              color: t.semantic.color.type.default.value,
            })}
          >
            {s.name}
          </Typography>
        ),
        impact: na ? null : toFivePointScore(s.impact, s.impactLabel),
        threat: s.threatSeverity != null && !na
          ? toFivePointScore(s.threatSeverity, s.threatSeverityLabel!)
          : null,
        vulnerability: s.vulnerabilitySeverity != null && !na
          ? toFivePointScore(s.vulnerabilitySeverity, s.vulnerabilitySeverityLabel!)
          : null,
        likelihood: s.likelihood != null && !na ? toLikelihoodScore(s.likelihood) : null,
        cyberRiskScore: s.cyberRiskScore != null && !na
          ? toCyberRiskScoreValue(s.cyberRiskScore)
          : null,
      };
    });
    
    return [riskRow, ...scenarioRows];
  });
}
```

3. Update the `useMemo` call that builds `scoringRows`:
```typescript
const scoringRows = useMemo(
  () => buildScoringRowsForScope(assessmentScenarios, scenarioNotApplicableIds),
  [assessmentScenarios, scenarioNotApplicableIds, catalogVersion],
);
```

4. **Remove** the `rowsForDisplay` masking logic (lines 631-651) — no longer needed since scores are already null in the data.

5. Update parent component (`CraNewAssessmentDraftPage.tsx` or similar) to pass `assessmentScenarios` from the draft:
```typescript
<AssessmentScoringTab
  assessmentScenarios={draft.assessmentScenarios ?? []}
  // ... other props ...
  // REMOVE: scenarioCatalogScoresReleased, scenarioManuallyRevealedScoreIds, etc.
/>
```

**Verification:**
- [ ] Scoring tab renders assessment scenarios instead of catalog scenarios
- [ ] Unscored scenarios show "-" for threat/vulnerability/likelihood/cyberRiskScore
- [ ] Impact is pre-filled correctly
- [ ] No masking logic executed (verify with debugger or console logs)
- [ ] Parent aggregation still works correctly

**Estimate:** 1.5 hours

---

## Task 5: Remove Masking Flags and Related Logic

**Files:**
- `src/data/craAssessmentDraftTypes.ts`
- `src/pages/AssessmentScoringTab.tsx`
- Any other files that reference these flags

**What:** Delete the now-obsolete masking flags and their conditional logic.

**Changes:**

1. **In `craAssessmentDraftTypes.ts`**, remove these fields from `CraNewAssessmentPersistedDraft`:
```typescript
// DELETE these fields:
scenarioCatalogScoresReleased?: boolean;
scenarioManuallyRevealedScoreIds?: ReadonlySet<string>;
```

2. **In `AssessmentScoringTab.tsx`**, remove these props and their usages:
```typescript
// DELETE these props from AssessmentScoringTabProps:
isNewCraDraftFlow?: boolean;
scenarioCatalogScoresReleased?: boolean;
scenarioManuallyRevealedScoreIds?: ReadonlySet<string>;
scenarioNavFromNewCraDraft?: boolean;
scenarioNavCatalogScoresReleased?: boolean;
scenarioNavManuallyRevealedScoreIds?: ReadonlySet<string>;
```

3. Remove any references to these flags in the component body (should be none left after Task 4).

4. Search the codebase for any other references:
```bash
grep -r "scenarioCatalogScoresReleased" src/
grep -r "scenarioManuallyRevealedScoreIds" src/
grep -r "isNewCraDraftFlow" src/
```

5. Update callers to remove these props from `<AssessmentScoringTab />` invocations.

**Verification:**
- [ ] No TypeScript errors after deletion
- [ ] Grep confirms no remaining references
- [ ] Scoring tab still renders correctly
- [ ] Navigation to scenario rationale page works

**Estimate:** 30 minutes

---

## Task 6: Update Scenario Rationale Page to Use Assessment Scenarios

**File:** `src/pages/CraScenarioScoringRationalePage.tsx` (or similar)

**What:** Update the scenario rationale/scoring page to read and write scores to the assessment scenario in the draft, not the catalog scenario.

**Changes:**

1. Retrieve the assessment scenario from the draft:
```typescript
const assessmentScenario = draft.assessmentScenarios?.find((s) => s.id === scenarioId);
```

2. Update score patching logic to update the assessment scenario:
```typescript
function patchAssessmentScenario(scenarioId: string, patch: Partial<AssessmentScenario>): void {
  const draft = getDraft();
  if (!draft.assessmentScenarios) return;
  
  const index = draft.assessmentScenarios.findIndex((s) => s.id === scenarioId);
  if (index === -1) return;
  
  draft.assessmentScenarios[index] = {
    ...draft.assessmentScenarios[index],
    ...patch,
  };
  
  setDraft({ assessmentScenarios: [...draft.assessmentScenarios] });
}
```

3. Update the save handler:
```typescript
const handleSave = () => {
  patchAssessmentScenario(scenarioId, {
    threatSeverity,
    threatSeverityLabel,
    vulnerabilitySeverity,
    vulnerabilitySeverityLabel,
    likelihood: threatSeverity * vulnerabilitySeverity,
    likelihoodLabel: getLikelihoodLabel(threatSeverity * vulnerabilitySeverity),
    cyberRiskScore: impact * (threatSeverity * vulnerabilitySeverity),
    cyberRiskScoreLabel: getCyberRiskScoreLabel(impact * (threatSeverity * vulnerabilitySeverity)),
    scoringRationale: editedRationale,
  });
  
  navigate(returnPath);
};
```

4. If the rationale page was using `scenarioManuallyRevealedScoreIds`, remove that logic (no longer needed).

**Verification:**
- [ ] Scenario rationale page loads assessment scenario correctly
- [ ] Saving scores updates the assessment scenario in the draft
- [ ] Scores persist across navigation (return to scoring tab and verify)
- [ ] AI scoring (if implemented) can bulk-update assessment scenarios

**Estimate:** 1 hour

---

## Task 7: Testing & Verification

**What:** End-to-end testing to ensure the new flow works correctly.

**Test Cases:**

1. **Create New Assessment:**
   - [ ] Start a new CRA assessment
   - [ ] Add assets to scope on the Scope tab
   - [ ] Navigate to the Scoring tab
   - [ ] Verify: scenarios are listed with only Impact pre-filled
   - [ ] Verify: threat, vulnerability, likelihood, cyber risk score all show "-"

2. **Score a Scenario Manually:**
   - [ ] Click a scenario to open rationale page
   - [ ] Enter threat severity and vulnerability severity
   - [ ] Save
   - [ ] Return to scoring tab
   - [ ] Verify: scores are now visible for that scenario
   - [ ] Verify: other scenarios still show "-"

3. **Parent Aggregation:**
   - [ ] Score all scenarios under a cyber risk
   - [ ] Verify: parent row shows aggregated scores (highest or average, depending on setting)

4. **Scope Changes:**
   - [ ] Remove an asset from scope
   - [ ] Verify: scenarios for that asset disappear
   - [ ] Add the asset back
   - [ ] Verify: scenarios reappear (newly generated, scores reset)

5. **Persistence:**
   - [ ] Score some scenarios
   - [ ] Refresh the page
   - [ ] Verify: scores are preserved

6. **AI Scoring (if implemented):**
   - [ ] Click "Start AI Scoring"
   - [ ] Wait for completion
   - [ ] Verify: all scenarios now have scores

7. **No Masking Flags:**
   - [ ] Search codebase for `scenarioCatalogScoresReleased`, `scenarioManuallyRevealedScoreIds`, `isNewCraDraftFlow`
   - [ ] Verify: no references remain
   - [ ] Verify: no conditional masking logic in scoring tab

**Estimate:** 1.5 hours

---

## Optional Enhancements (Post-MVP)

These are not required for the initial fix but could be valuable follow-ups:

1. **Preserve Scores on Scope Changes:**
   - When scope changes (e.g., asset temporarily removed then re-added), preserve any existing scores for matching scenarios
   - Implement by comparing old vs. new assessment scenario lists and merging scores by `sourceCatalogScenarioId + assetId`

2. **Remove Catalog Scenario Baseline Scores:**
   - Update `buildScenarios()` in `scenarios.ts` to set `threatSeverity` and `vulnerabilitySeverity` to `null` instead of deterministic values
   - This makes the catalog scenarios true "templates" with no inherent scores

3. **Assessment Scenario History:**
   - Track score changes over time (who scored, when, what values)
   - Useful for audit trails

4. **Bulk Score Import:**
   - Allow importing scores from a previous assessment (if scenarios match)

---

## Rollback Plan

If this change introduces regressions:

1. Revert commits in reverse task order (Task 7 → Task 6 → ... → Task 1)
2. Restore masking flags if needed as a temporary fix
3. File bugs for any discovered issues

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| **Performance:** Large assessments with 100+ scenarios may slow down regeneration | Profile with realistic data; add debouncing if needed |
| **Data loss:** Scope changes could accidentally reset scores | Implement score preservation (enhancement #1) or warn user before regenerating |
| **Persistence size:** Assessment scenarios duplicate catalog scenario metadata | Acceptable for prototype; optimize in production (store deltas only) |
| **AI scoring integration:** Existing AI scoring code may assume catalog scenario IDs | Update AI scoring to target assessment scenario IDs instead |

---

## Success Criteria

- [ ] New assessments show unscored scenarios (only Impact pre-filled)
- [ ] Manual scoring persists correctly
- [ ] Parent aggregation works
- [ ] Masking flags removed
- [ ] No TypeScript errors
- [ ] All test cases pass
- [ ] Code review approved

---

## Estimate Summary

| Task | Estimate |
|------|----------|
| Task 1: Define types | 30 min |
| Task 2: Creation logic | 45 min |
| Task 3: Draft storage integration | 1 hour |
| Task 4: Scoring tab refactor | 1.5 hours |
| Task 5: Remove masking flags | 30 min |
| Task 6: Rationale page updates | 1 hour |
| Task 7: Testing | 1.5 hours |
| **Total** | **~7 hours** |

---

## Next Steps

1. Review this plan with stakeholders
2. Execute tasks in sequence (tasks are dependent)
3. Run test cases after Task 7
4. Deploy and monitor for regressions
5. Consider optional enhancements for future iterations
