import type { ReactNode } from "react";
import { Box } from "@mui/material";

type Props = {
  header?: ReactNode;
  children: ReactNode;
};

export default function PageShell({ header, children }: Props) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        p: { xs: 2, md: 3 },
        background: "linear-gradient(140deg, #f7f3e8 0%, #e8f7f0 45%, #e7f1ff 100%)",
        border: "1px solid #e9e2d6",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 10% 10%, rgba(255,214,102,0.28) 0%, rgba(255,214,102,0) 35%), radial-gradient(circle at 90% 20%, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0) 40%)",
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {header}
        {children}
      </Box>
    </Box>
  );
}
