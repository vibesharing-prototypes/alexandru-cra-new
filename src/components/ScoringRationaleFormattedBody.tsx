import { Fragment } from "react";
import { Box, Typography } from "@mui/material";

const LABEL_SEPARATOR = ": ";

export type ScoringRationaleFormattedBodyProps = {
  text: string;
  /** MUI Typography variant for body text (default matches rationale fields). */
  variant?: "body1";
};

/**
 * Renders scoring rationale plain text with the clause before the first "{@code : }"
 * in each paragraph (split on blank lines) at semibold weight — e.g.
 * {@code Threat level (Very high): }.
 *
 * Paragraphs stay joined with {@code \n\n} inside one {@code pre-wrap} block so layout
 * matches a multiline plain-text field used as an underlay.
 */
export default function ScoringRationaleFormattedBody({
  text,
  variant = "body1",
}: ScoringRationaleFormattedBodyProps) {
  const paragraphs = text.split(/\n\n/);

  return (
    <Typography
      component="div"
      variant={variant}
      sx={({ tokens: t }) => ({
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        color: t.semantic.color.type.muted.value,
        m: 0,
        width: "100%",
      })}
    >
      {paragraphs.map((paragraph, index) => {
        const sepIndex = paragraph.indexOf(LABEL_SEPARATOR);
        const hasLabel = sepIndex !== -1;
        const prefix = hasLabel ? paragraph.slice(0, sepIndex + LABEL_SEPARATOR.length) : "";
        const rest = hasLabel ? paragraph.slice(sepIndex + LABEL_SEPARATOR.length) : paragraph;

        return (
          <Fragment key={index}>
            {index > 0 ? "\n\n" : null}
            {hasLabel ? (
              <>
                <Box
                  component="span"
                  sx={({ tokens: t }) => ({
                    fontWeight: t.semantic.fontWeight.emphasis.value,
                    color: t.semantic.color.type.default.value,
                  })}
                >
                  {prefix}
                </Box>
                <Box component="span">{rest}</Box>
              </>
            ) : (
              paragraph
            )}
          </Fragment>
        );
      })}
    </Typography>
  );
}
