import { AppBar, Toolbar, Typography, Box, Avatar } from "@mui/material";

export default function Topbar() {
  return (
    <AppBar
      position="sticky"
      color="transparent"
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "rgba(247,243,232,0.7)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontFamily: '"Playfair Display", "Times New Roman", serif',
            letterSpacing: 0.4,
          }}
        >
          Smart Soil — Admin
        </Typography>

        <Box display="flex" gap={2} alignItems="center">
          <Avatar sx={{ bgcolor: "#0f766e", color: "#fef9e7" }}>B&J</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
