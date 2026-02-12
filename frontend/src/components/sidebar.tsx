import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Avatar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import { useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 260;

type Props = {
  mobileOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ mobileOpen, onClose }: Props) {
  const nav = useNavigate();
  const location = useLocation();

  const goTo = (path: string) => {
    nav(path);
    onClose();
  };

  const content = (
    <>
      <Toolbar sx={{ borderBottom: "1px solid #e7dcc9" }}>
        <Box display="flex" gap={2} alignItems="center">
          <Avatar sx={{ bgcolor: "#0f766e", color: "#fef9e7" }}>B&J</Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontFamily: '"Playfair Display", "Times New Roman", serif', letterSpacing: 0.3 }}
            >
              SmartSoil
            </Typography>
            <Typography variant="caption" color="text.secondary">Admin Console</Typography>
          </Box>
        </Box>
      </Toolbar>
      <List sx={{ mt: 1 }}>
        <ListItemButton
          selected={location.pathname === "/"}
          onClick={() => goTo("/")}
          sx={{
            mx: 1,
            borderRadius: 2,
            "&:hover": { bgcolor: "rgba(15,118,110,0.08)" },
          }}
        >
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton
          selected={location.pathname.startsWith("/farmers")}
          onClick={() => goTo("/farmers")}
          sx={{
            mx: 1,
            borderRadius: 2,
            "&:hover": { bgcolor: "rgba(15,118,110,0.08)" },
          }}
        >
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Farmers" />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: 0,
            bgcolor: "#f6f1e7",
          },
        }}
      >
        {content}
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: 0,
            bgcolor: "#f6f1e7",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}
