// src/pages/empleados/form/InfoLine.tsx
import { memo } from "react";
import { Stack, Typography } from "@mui/material";

function InfoLine({ k, v }: { k: string; v?: any }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.25 }}>
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        {k}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        textAlign="right"
        sx={{ ml: 2, wordBreak: "break-word" }}
      >
        {v ?? ""}
      </Typography>
    </Stack>
  );
}

export default memo(InfoLine);
