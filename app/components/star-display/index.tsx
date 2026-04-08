import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Box, Stack } from "@mui/material";

export function StarDisplay({ rating }: { rating: number }) {
  return (
    <Stack direction="row" gap={0.125} alignItems="center">
      {[1, 2, 3, 4, 5].map((n) => (
        <Box key={n} component="span" sx={{ color: n <= rating ? "warning.main" : "action.disabled", display: "flex" }}>
          {n <= rating ? <StarIcon sx={{ fontSize: 13 }} /> : <StarBorderIcon sx={{ fontSize: 13 }} />}
        </Box>
      ))}
    </Stack>
  );
}
