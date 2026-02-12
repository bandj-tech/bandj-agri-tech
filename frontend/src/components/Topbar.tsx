import { AppBar, Toolbar, Typography, Box, Avatar, IconButton, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

type Props = {
  onMenuClick: () => void;
  userEmail?: string;
  onLogout?: () => void;
};

export default function Topbar({ onMenuClick, userEmail, onLogout }: Props) {
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

        <Box display="flex" gap={{ xs: 1, sm: 2 }} alignItems="center" sx={{ pl: 1 }}>
          {userEmail && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" }, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {userEmail}
            </Typography>
          )}
          <Avatar sx={{ bgcolor: "#0f766e", color: "#fef9e7" }}>B&J</Avatar>
          {onLogout && (
            <Button variant="outlined" size="small" onClick={onLogout}>
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
