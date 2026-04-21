import { Box, Button, Card, CardContent, CardHeader, Link, Stack, Typography } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";

ChartJS.register(ArcElement, Tooltip, Legend);

export type RiskStatusDonutSegment = {
  label: string;
  value: number;
  color: string;
};

export type RiskStatusDonutProps = {
  title?: string;
  centerLabel?: string;
  data: RiskStatusDonutSegment[];
};

export default function RiskStatusDonut({
  title = "Workflow status",
  centerLabel = "Risks",
  data,
}: RiskStatusDonutProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: data.map((d) => d.color),
        borderWidth: 0,
        cutout: "72%",
      },
    ],
  };

  return (
    <Card sx={{ width: 360, maxWidth: 360, minWidth: 0, border: "none" }}>
      <CardHeader
        title={
          <Typography variant="h4" component="h2" fontWeight={600}>
            {title}
          </Typography>
        }
        action={
          <Button
            variant="text"
            size="small"
            aria-label={`More options for ${title}`}
          >
            <MoreIcon aria-hidden />
          </Button>
        }
        sx={{ display: "flex" }}
      />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          pt: 0,
          height: "100%",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: 220,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Typography
              component="span"
              sx={({ tokens: t }) => ({
                color: t.semantic.color.type.default.value,
                fontWeight: 400,
                fontSize: 26,
                lineHeight: "34px",
              })}
            >
              {total}
            </Typography>
            <Typography
              variant="body1"
              sx={({ tokens: t }) => ({
                color: t.semantic.color.type.muted.value,
                lineHeight: "24px",
                letterSpacing: "0.2px",
              })}
            >
              {centerLabel}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            columnGap: 2,
            rowGap: 2,
            width: "100%",
          }}
        >
          {data.map((item) => (
            <Stack key={item.label} gap={0}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 0.5,
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="textSm"
                  sx={({ tokens: t }) => ({
                    color: t.semantic.color.type.default.value,
                  })}
                >
                  {item.label}
                </Typography>
              </Stack>
              <Typography variant="textMd" sx={{ pl: 3, fontWeight: 600 }}>
                <Link href="#" underline="hover">
                  {item.value}
                </Link>
              </Typography>
            </Stack>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
