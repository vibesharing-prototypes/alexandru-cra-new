# Task 7: Testing & Verification Checklist

**Date:** 2026-05-08  
**Test Environment:** http://localhost:5174  
**Status:** Ready for testing

---

## Pre-Test Verification ✅

- ✅ Dev server started successfully on port 5174
- ✅ No TypeScript compilation errors in modified files
- ✅ All masking flags removed (grep verified: 0 matches)
- ✅ All tasks 1-6 completed

---

## Test Case 1: Create New Assessment

**Objective:** Verify scenarios show only Impact pre-filled, all other scores are null/"-"

**Steps:**
1. Navigate to http://localhost:5174
2. Go to Cyber Risk > Cyber Risk Assessments
3. Click "New Assessment" or navigate to `/cyber-risk/cyber-risk-assessments/new`
4. Fill in assessment name, owner, due date
5. Navigate to **Scope** tab
6. Add at least 2 assets to the scope
7. Navigate to **Scoring** tab

**Expected Results:**
- ✅ Scenarios are listed (grouped by cyber risk)
- ✅ **Impact** column shows values (e.g., "3 - Moderate", "4 - High")
- ✅ **Threat** column shows "-" (not scored)
- ✅ **Vulnerability** column shows "-" (not scored)
- ✅ **Likelihood** column shows "-" (not scored)
- ✅ **Cyber Risk Score** column shows "-" (not scored)

**Actual Results:**
☐ PASS / ☐ FAIL

**Notes:**


---

## Test Case 2: Score a Scenario Manually

**Objective:** Verify manual scoring persists correctly

**Steps:**
1. From the Scoring tab (Test Case 1), click on any scenario row
2. Should navigate to the scenario rationale page
3. Select a **Threat Severity** (e.g., "3 - Moderate")
4. Select a **Vulnerability Severity** (e.g., "4 - High")
5. Optionally edit the rationale text
6. Click **Save** button
7. Should return to Scoring tab

**Expected Results:**
- ✅ Scenario row now shows:
  - Threat: "3 - Moderate" (or selected value)
  - Vulnerability: "4 - High" (or selected value)
  - Likelihood: "12" (3 × 4)
  - Cyber Risk Score: calculated (Impact × Likelihood)
- ✅ Other scenarios still show "-" (unscored)
- ✅ Parent cyber risk row does NOT aggregate until all applicable scenarios are scored

**Actual Results:**
☐ PASS / ☐ FAIL

**Notes:**


---

## Test Case 3: Parent Aggregation

**Objective:** Verify parent cyber risk rows aggregate scenario scores correctly

**Steps:**
1. From the Scoring tab, score **all scenarios** under one cyber risk
2. Use the aggregation toggle (if available) to switch between "Highest" and "Average"

**Expected Results:**
- ✅ Parent cyber risk row shows aggregated scores:
  - **Highest method:** Shows max values across all child scenarios
  - **Average method:** Shows average values across all child scenarios
- ✅ Aggregation respects "Not Applicable" scenarios (excluded from calculation)
- ✅ Aggregation respects excluded scenarios (not shown)

**Actual Results:**
☐ PASS / ☐ FAIL

**Notes:**


---

## Test Case 4: Scope Changes

**Objective:** Verify assessment scenarios regenerate when scope changes

**Sub-test 4a: Add Asset**
1. Navigate to **Scope** tab
2. Add a new asset to the assessment scope
3. Return to **Scoring** tab

**Expected:**
- ✅ New scenarios appear for the added asset
- ✅ New scenarios show only Impact pre-filled
- ✅ Existing scored scenarios retain their scores (score preservation)

**Actual:**
☐ PASS / ☐ FAIL

**Sub-test 4b: Remove Asset**
1. Navigate to **Scope** tab
2. Remove an asset from the assessment scope
3. Return to **Scoring** tab

**Expected:**
- ✅ Scenarios for the removed asset disappear
- ✅ Other scenarios remain unchanged

**Actual:**
☐ PASS / ☐ FAIL

**Sub-test 4c: Re-add Asset (Score Preservation)**
1. Re-add the same asset you removed in 4b
2. Return to **Scoring** tab

**Expected:**
- ✅ Scenarios for that asset reappear
- ✅ **If the scenario was previously scored, scores are preserved** (bonus enhancement)
- ✅ If never scored, shows only Impact

**Actual:**
☐ PASS / ☐ FAIL

**Notes:**


---

## Test Case 5: Persistence

**Objective:** Verify scores persist across page refreshes

**Steps:**
1. Score at least 2 scenarios manually (see Test Case 2)
2. **Refresh the page** (Cmd+R / Ctrl+R)
3. Navigate back to the Scoring tab

**Expected Results:**
- ✅ Assessment still exists (loaded from draft)
- ✅ Scored scenarios show the same scores as before refresh
- ✅ Unscored scenarios still show "-"
- ✅ No scores are lost

**Actual Results:**
☐ PASS / ☐ FAIL

**Notes:**


---

## Test Case 6: AI Scoring (If Implemented)

**Objective:** Verify AI scoring bulk-updates assessment scenarios

**Note:** This test may not be applicable if AI scoring is not yet implemented.

**Steps:**
1. From the Scoring tab, click **"Start AI Scoring"** button
2. Wait for AI scoring to complete

**Expected Results:**
- ✅ All in-scope scenarios are scored
- ✅ Threat, Vulnerability, Likelihood, Cyber Risk Score populated
- ✅ Parent rows show aggregated values

**Actual Results:**
☐ PASS / ☐ FAIL / ☐ NOT APPLICABLE

**Notes:**


---

## Test Case 7: No Masking Flags Remain

**Objective:** Verify masking flags are fully removed from codebase

**Steps:**
1. Run grep command:
   ```bash
   grep -rn "scenarioCatalogScoresReleased\|scenarioManuallyRevealedScoreIds\|isNewCraDraftFlow" src/ --include="*.tsx" --include="*.ts"
   ```

**Expected Results:**
- ✅ Command returns no matches (empty output)

**Actual Results:**
✅ PASS — Verified during Task 5, zero matches

**Notes:**
Confirmed: no masking flags remain in the codebase.

---

## Regression Tests

### RT1: Results Tab Still Works
**Steps:**
1. Score at least one scenario
2. Navigate to **Results** tab

**Expected:**
- ✅ Results tab loads without errors
- ✅ Scored scenarios appear in results view
- ✅ Filters and matrix view work correctly

**Actual:**
☐ PASS / ☐ FAIL

---

### RT2: Assessment Details Header
**Steps:**
1. Check the assessment details header (name, owner, due date, phase)

**Expected:**
- ✅ Header displays correctly
- ✅ Phase transitions work (Draft → Scoping → In Progress → Review)

**Actual:**
☐ PASS / ☐ FAIL

---

### RT3: Scenario Navigation
**Steps:**
1. From Scoring tab, click scenario to open rationale page
2. Use breadcrumbs or back button to return

**Expected:**
- ✅ Navigation works both directions
- ✅ State is preserved (scroll position, expanded rows)

**Actual:**
☐ PASS / ☐ FAIL

---

## Edge Cases

### E1: Empty Assessment (No Assets)
**Steps:**
1. Create new assessment
2. Navigate to Scoring tab without adding assets

**Expected:**
- ✅ Shows empty state message
- ✅ "Go to Scope" button works

**Actual:**
☐ PASS / ☐ FAIL

---

### E2: All Scenarios Marked N/A
**Steps:**
1. Create assessment with scenarios
2. Mark all scenarios as "Not Applicable"
3. Check parent row aggregation

**Expected:**
- ✅ Parent row shows "-" (no applicable scenarios to aggregate)

**Actual:**
☐ PASS / ☐ FAIL

---

### E3: Exclude All Cyber Risks
**Steps:**
1. Create assessment with assets
2. Navigate to Scope > Cyber Risks
3. Exclude all cyber risks
4. Return to Scoring tab

**Expected:**
- ✅ Shows empty state (no scenarios)

**Actual:**
☐ PASS / ☐ FAIL

---

## Test Summary

| Category | Passed | Failed | Not Applicable |
|----------|--------|--------|----------------|
| **Core Tests (1-7)** | ☐ / 7 | ☐ / 7 | ☐ / 7 |
| **Regression Tests** | ☐ / 3 | ☐ / 3 | ☐ / 3 |
| **Edge Cases** | ☐ / 3 | ☐ / 3 | ☐ / 3 |
| **Total** | ☐ / 13 | ☐ / 13 | ☐ / 13 |

---

## Issues Found

| Issue # | Severity | Description | Status |
|---------|----------|-------------|--------|
| | | | |

---

## Test Completion

**Tested By:** _________________  
**Date:** _________________  
**Overall Result:** ☐ PASS / ☐ FAIL  

**Sign-off:** All critical tests passed, implementation ready for QA handoff.

---

## Notes for Testers

1. **Dev server must be running:** Start with `npm run dev`
2. **Browser console:** Check for JavaScript errors during testing
3. **Network tab:** Verify no failed API calls (though this is a mock-data app)
4. **localStorage:** Assessment drafts are persisted to browser localStorage/IndexedDB
5. **Clear storage:** If tests produce unexpected results, clear browser storage and restart
