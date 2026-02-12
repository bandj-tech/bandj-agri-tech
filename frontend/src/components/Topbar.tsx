import { AppBar, Toolbar, Typography, Box, Avatar, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

type Props = {
  onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: Props) {
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
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuClick}
          sx={{ mr: 1, display: { xs: "inline-flex", md: "none" } }}
          aria-label="open navigation"
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontFamily: '"Playfair Display", "Times New Roman", serif',
            letterSpacing: 0.4,
            fontSize: { xs: "1.05rem", sm: "1.25rem" },
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Smart Soil Admin
        </Typography>

        <Box display="flex" gap={2} alignItems="center" sx={{ pl: 1 }}>
          <Avatar sx={{ bgcolor: "#0f766e", color: "#fef9e7" }}>B&J</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
