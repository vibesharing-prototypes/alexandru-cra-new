import { useMemo, useState } from "react";
import {
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import RisksMatrix from "./RisksMatrix.js";
import RiskStatusDonut from "./RiskStatusDonut.js";
import { cyberRisks } from "../data/cyberRisks.js";
import { getBusinessUnitById } from "../data/businessUnits.js";

type BusinessUnitOption = { id: string; label: string };

function businessUnitOptionsFromRisks(): BusinessUnitOption[] {
  const ids = new Set(cyberRisks.map((r) => r.businessUnitId));
  return Array.from(ids)
    .map((id) => {
      const bu = getBusinessUnitById(id);
      return { id, label: bu?.name ?? id };
    })
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

/** Cyber risks overview: workflow donut, likelihood/impact matrix, business unit filter. */
export default function RisksHeroSection() {
  const buOptions = useMemo(() => businessUnitOptionsFromRisks(), []);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<BusinessUnitOption | null>(
    null,
  );

  const filteredRisks = useMemo(() => {
    if (!selectedBusinessUnit) {
      return cyberRisks;
    }
    return cyberRisks.filter((r) => r.businessUnitId === selectedBusinessUnit.id);
  }, [selectedBusinessUnit]);

  return (
    <Card
      sx={({ tokens }) => ({
        backgroundColor: tokens.semantic.color.background.container.value,
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
          },
        }}
        title={
          <Typography variant="h3" component="h2" sx={{ fontWeight: 600 }}>
            Overview
          </Typography>
        }
        action={
          <Autocomplete<BusinessUnitOption, false, false, false>
            size="medium"
            sx={{ width: 500, minWidth: 0 }}
            options={buOptions}
            value={selectedBusinessUnit}
            onChange={(_, newValue) => {
              setSelectedBusinessUnit(newValue);
            }}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth={false}
                label="Business unit"
                placeholder="All business units"
                margin="none"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "8px",
                  width: 500,
                  minWidth: 0,
                  "& .MuiInputBase-root": {
                    width: "100%",
                  },
                  "& .MuiInputLabel-root": {
                    paddingBottom: 0,
                  },
                }}
                slotProps={{
                  inputLabel: {
                    sx: {
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      width: 130,
                      pb: 0,
                    },
                  },
                }}
              />
            )}
          />
        }
      />
      <CardContent>
        <Stack direction="row" gap={3} sx={{ alignItems: "stretch" }}>
          <RiskStatusDonut risks={filteredRisks} />
          <RisksMatrix risks={filteredRisks} sx={{ flex: 3, minWidth: 0 }} />
        </Stack>
      </CardContent>
    </Card>
  );
}
