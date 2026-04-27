import { useMemo } from "react";
import { Button, Card, CardContent, CardHeader, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ExportIcon from "@diligentcorp/atlas-react-bundle/icons/Export";

import AssetsByCyberRiskScoreDonut from "./AssetsByCyberRiskScoreDonut.js";
import RisksMatrix, { type AssessmentMatrixMode } from "./RisksMatrix.js";
import type { MockCyberRisk } from "../data/types.js";
import type { AssessmentAssetResultRow } from "../pages/craAssessmentScopeRows.js";
import type { CraScoringTypeChoice } from "../pages/craNewAssessmentDraftStorage.js";
import { buildAssetCyberRiskDonutSegmentsFromAssessmentAssetRows } from "../utils/assetsByCyberRiskScoreDonutData.js";

function assessmentMatrixModeFromScoringType(scoringType: CraScoringTypeChoice): AssessmentMatrixMode {
  if (scoringType === "inherent") return "inherentOnly";
  return "residualPreferred";
}

export type ResultsHeroProps = {
  scopedRisks: readonly MockCyberRisk[];
  assetResultRows: readonly AssessmentAssetResultRow[];
  /** Details-tab scoring type: drives Inherent-only vs Residual-default matrix. */
  scoringType: CraScoringTypeChoice;
};

/** Assessment results overview: scoped likelihood/impact matrix and assets-by-score donut (aligned with Assets grid). */
export default function ResultsHero({ scopedRisks, assetResultRows, scoringType }: ResultsHeroProps) {
  const { tokens: themeTokens } = useTheme();
  const donutSegments = useMemo(
    () => buildAssetCyberRiskDonutSegmentsFromAssessmentAssetRows(assetResultRows),
    [assetResultRows],
  );

  return (
    <Card
      sx={({ tokens }) => ({
        backgroundColor: tokens.semantic.color.surface.variant.value,
        border: "none",
      })}
    >
      <CardHeader
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          "& .MuiCardHeader-content": {
            width: "fit-content",
            flex: "0 0 auto",
          },
          "& .MuiCardHeader-action": {
            flex: 1,
            minWidth: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            margin: 0,
          },
        }}
        title={
          <Typography variant="h3" component="h2" sx={{ fontWeight: 600 }}>
            Overview
          </Typography>
        }
        action={
          <Button
            type="button"
            variant="text"
            size="medium"
            startIcon={<ExportIcon aria-hidden />}
            aria-label="Export assessment results overview"
          >
            Export
          </Button>
        }
      />
      <CardContent>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          gap={3}
          alignItems="stretch"
          sx={{ width: "100%" }}
        >
          <RisksMatrix
            risks={scopedRisks}
            assessmentMatrixMode={assessmentMatrixModeFromScoringType(scoringType)}
            sx={({ tokens: t }) => ({
              flex: { lg: "1.5 1 0" },
              minWidth: 0,
              width: "100%",
              border: "none",
              bgcolor: t.semantic.color.background.base.value,
              borderRadius: "16px",
              boxShadow: "none",
            })}
          />
          <AssetsByCyberRiskScoreDonut
            segmentsOverride={donutSegments}
            sx={{
              flex: { lg: "1 1 480px" },
              minWidth: { lg: 320 },
              width: "100%",
              maxWidth: { lg: 480 },
              border: "none",
              bgcolor: themeTokens.semantic.color.background.base.value,
              borderRadius: "16px",
              boxShadow: "none",
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
