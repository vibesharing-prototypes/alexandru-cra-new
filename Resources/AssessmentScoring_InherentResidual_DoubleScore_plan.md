# Plan: Inherent + Residual scoring type and DoubleScoreCell in scoring table

## Goal

When the user selects **Inherent + Residual** in the AI scoring card on the Scoring tab, render **`DoubleScoreCell`** in the **Threat severity**, **Vulnerability severity**, **Likelihood**, and **Cyber risk score** table columns (all data rows). The **Impact** column keeps the existing **`RiskLegendCell`**.

Value formatting stays aligned with current behavior:

- Threat / Vulnerability: 5-point scale (existing `toFivePointScore` / `ScoreValue`).
- Likelihood: 1–25 scale (`toLikelihoodScore`).
- Cyber risk score: 1–125 scale (`toCyberRiskScoreValue`).

Until the data model exposes separate inherent vs residual numbers per metric, **both** `DoubleScoreCell` legs use the **same** `ScoreValue` as today’s single cell (duplicate display for prototype).

## Prerequisites

- [`src/components/DoubleScoreCell.tsx`](src/components/DoubleScoreCell.tsx) exists and wraps two [`LabelScoreLegend`](src/components/LabelScoreLegend.tsx) instances.

## 1. Controlled selection on `AiContentCardAssessmentPreset`

**File:** [`src/components/AiContentCard.tsx`](src/components/AiContentCard.tsx)

- Extend **`AiContentCardAssessmentPresetProps`** with optional:
  - `assessmentValue?: string`
  - `onAssessmentChange?: (value: string) => void`
- In **`AiContentCardAssessmentPreset`**, support **controlled** mode when **both** props are provided; otherwise keep **uncontrolled** `useState(defaultAssessmentValue)` so [`ActivityPage`](src/pages/ActivityPage.tsx) and other callers stay unchanged.

## 2. Scoring tab state and preset wiring

**File:** [`src/pages/AssessmentScoringTab.tsx`](src/pages/AssessmentScoringTab.tsx)

- Add state, e.g. `const [scoringType, setScoringType] = useState("residual")` (matches current default for scoring options).
- Pass **`assessmentValue={scoringType}`** and **`onAssessmentChange={setScoringType}`** into **`AiContentCardAssessmentPreset`** (remove redundant `defaultAssessmentValue` on the preset when controlled).
- Derive **`showDoubleScoreColumns = scoringType === "inherent_residual"`** (value must match [`SCORING_TYPE_OPTIONS`](src/pages/AssessmentScoringTab.tsx) entry for “Inherent + Residual”, e.g. `inherent_residual`).

## 3. Table cell rendering

**File:** [`src/pages/AssessmentScoringTab.tsx`](src/pages/AssessmentScoringTab.tsx)

- Import **`DoubleScoreCell`**.
- Add a small helper (e.g. `ThreatVulnLikelihoodCrsCell`) that takes `showDouble: boolean` and `value: ScoreValue`:
  - If `showDouble`: `<DoubleScoreCell inherent={value} residual={value} />`
  - Else: `<RiskLegendCell value={value} />`
- In the **non-skeleton** row branch, use the helper for the four metric columns only, reusing the **exact same value expressions** as today for threat, vulnerability, likelihood, and cyber risk score (including `idleMode`, cyber-risk aggregation rows, etc.).
- Leave **Impact** column as **`RiskLegendCell`** only.
- **Processing** skeleton rows: keep existing **`MetricScoreSkeleton`** (no change required unless product asks for double-width skeletons later).

## 4. Verification

- Run **`npx tsc --noEmit`**.
- Manually: switch radio to **Inherent + Residual** and confirm double columns in the four columns; other options show single **`RiskLegendCell`**.

## Files to touch

| File | Change |
|------|--------|
| [`src/components/AiContentCard.tsx`](src/components/AiContentCard.tsx) | Controlled/uncontrolled preset API |
| [`src/pages/AssessmentScoringTab.tsx`](src/pages/AssessmentScoringTab.tsx) | State, preset props, helper + table cells |

## Out of scope (follow-ups)

- Distinct inherent vs residual values per row (requires schema/API changes).
- Changing **LabelScoreLegend** number format to match **RiskLegendCell** (`numeric - label` vs space) unless explicitly requested.
