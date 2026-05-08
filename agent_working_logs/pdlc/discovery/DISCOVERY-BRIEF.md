# Discovery Brief: Assessment-Scoped Scenario Instances (Unscored)

| Field | Value |
|-------|-------|
| **Discovery Status** | Validated |
| **Business Unit** | Cyber Risk |
| **Product** | CRA (Cyber Risk Assessment) |
| **Strategic Goal** | Accurate AI-assisted cyber risk scoring workflow |

---

## 1. Problem Discovery

### 1.1 Problem Statement

When a user creates a new Cyber Risk Assessment and reaches the Scoring tab, all scenarios display pre-filled scores (threat severity, vulnerability severity, likelihood, cyber risk score) inherited from the shared catalog. This breaks the intended workflow: scores should only appear **after** the user initiates AI scoring or manually scores each scenario. The only pre-populated value should be **Impact** (derived from asset criticality, which is a library attribute).

### 1.2 Target Users & Pain Points

| Persona | Pain Point |
|---------|-----------|
| Risk Analyst (primary) | Sees scores on a brand-new assessment before any scoring has occurred — confusing and misleading |
| CISO / Reviewer | Cannot distinguish AI-scored vs. inherited scores — undermines trust in assessment results |
| Auditor | Pre-filled scores may appear as if the assessment was completed without proper diligence |

### 1.3 Evidence & Insights

**Technical root cause (code-verified):**

1. `src/data/scenarios.ts` → `buildScenarios()` generates all scenarios with deterministic scores via `scenarioSeverityValues(seq)` (lines 120-127). Every scenario gets `threatSeverity` and `vulnerabilitySeverity` values baked in at generation time.

2. `src/data/assessmentScopeRollup.ts` → `assessmentScopedScenarios()` returns **direct references** to these pre-scored library scenarios. No copies are made; no scores are stripped.

3. `src/pages/AssessmentScoringTab.tsx` → `buildScoringRowsForScope()` (line 246) reads `s.threatSeverity`, `s.vulnerabilitySeverity`, `s.likelihood`, `s.cyberRiskScore` directly from the catalog scenario objects and renders them in the data grid.

4. The `scenarioCatalogScoresReleased` flag (line 631-651) was added to mask **some** scores in the "new CRA draft flow", but it only hides threat/vulnerability/likelihood/cyberRiskScore — and it still shows the pre-filled Impact. However, the underlying issue remains: the data model ties the assessment to pre-scored catalog scenarios rather than fresh assessment-specific instances.

**Consequence:** The UX pretends scores don't exist (via masking flags) rather than the data actually being unscored. This creates fragile state management and makes persistence of assessment-specific scores impossible without overwriting the shared catalog.

### 1.4 Opportunity Size

| Metric | Value |
|--------|-------|
| Affected workflow | Every new CRA assessment (100% of creation flows) |
| UX integrity | High — scoring is the primary value proposition of the CRA tool |
| Technical debt reduction | Eliminates 3 masking flags (`scenarioCatalogScoresReleased`, `scenarioManuallyRevealedScoreIds`, `isNewCraDraftFlow`) and their associated complexity (~50 lines of conditional logic in the scoring tab) |
| Multi-assessment support | Unlocks the ability for multiple assessments to score the same scenario independently |

---

## 2. Solution Discovery

### 2.1 Solution Options

#### Option A: Assessment-Scoped Scenario Instances (New Data Layer)

Create new "assessment scenario" objects when an assessment is started. These are derived from library scenarios but have:
- A new unique ID (e.g., `ASC-{assessmentId}-{seq}`)
- `impact` pre-filled from asset criticality
- All other score fields set to `null` / unscored
- A `sourceScenarioId` reference back to the catalog scenario (for rationale text, name, relationships)

**Pros:**
- Clean separation: library scenarios are templates; assessment scenarios are scorable instances
- No masking flags needed — data accurately represents "unscored"
- Enables multiple assessments to score independently
- Simpler UI logic (render what the data says)

**Cons:**
- Requires new data types, storage, and persistence changes
- Existing scored-assessment data (if any) would need migration
- More objects in memory (one set per assessment)

#### Option B: Strip Scores at Assessment Scope Boundary

Modify `assessmentScopedScenarios()` to return shallow copies of catalog scenarios with score fields nulled out. Assessment-specific scores stored in a per-assessment overlay map (like current `scenarioOverrides` but keyed by `assessmentId + scenarioId`).

**Pros:**
- Minimal new data types — reuses `MockScenario` shape
- No new ID scheme needed
- Smaller change surface

**Cons:**
- Still fundamentally references library scenarios (fragile coupling)
- Per-assessment overlay map adds complexity to persistence
- Harder to reason about which version of a scenario you're looking at
- Doesn't cleanly solve multi-assessment divergence

#### Option C: Keep Current Masking Approach (Improve It)

Extend the existing `scenarioCatalogScoresReleased` / `isNewCraDraftFlow` flags to fully mask all scores including parent aggregation, and ensure the flag is always `false` on new assessments until AI scoring completes or manual scoring occurs.

**Pros:**
- Smallest code change
- No data model changes
- Works for the immediate UX requirement

**Cons:**
- Treats the symptom, not the cause
- Growing conditional complexity in the scoring tab
- Still cannot support multiple assessments with different scores for the same scenario
- Masking flags are error-prone (any new code path must remember to check them)

### 2.2 Chosen Solution Direction

**Option A: Assessment-Scoped Scenario Instances**

### 2.3 Rationale

Option A is the correct architectural fix because:

1. **Data integrity**: An unscored scenario should *be* unscored in the data, not appear scored but get visually hidden. This eliminates an entire class of masking bugs.

2. **Multi-assessment support**: The product will eventually need multiple assessments scoring the same underlying risk/threat/asset combinations differently. Assessment-scoped instances make this trivial.

3. **Simplifies the UI**: `AssessmentScoringTab` can remove the `isNewCraDraftFlow` / `scenarioCatalogScoresReleased` / `scenarioManuallyRevealedScoreIds` conditional branches. It just renders what the data says.

4. **Clean lifecycle**: Assessment scenarios are created when the assessment starts, scored during the assessment, and finalized when approved. The catalog scenarios remain as the "template" library.

5. **Acceptable cost**: This is a prototype/mock-data app — there's no production migration burden. The new data type is straightforward (subset of `MockScenario` with nullable score fields).

---

## Discovery Sign-offs

| Role | Name | Date | Status |
|------|------|------|--------|
| PM | — | — | Pending |
| UX | — | — | Pending |

---

## Next Steps

1. Proceed to implementation planning (`/plan`) to define:
   - Assessment scenario data type
   - Creation logic (triggered when assessment moves to Scoring phase or when scope is finalized)
   - Storage/persistence in the draft
   - Migration of `AssessmentScoringTab` to consume assessment scenarios instead of catalog scenarios
   - Cleanup of masking flags
2. Consider whether the catalog `scenarios.ts` baseline scores should be removed entirely or kept as "example/reference" data only used outside assessments.
