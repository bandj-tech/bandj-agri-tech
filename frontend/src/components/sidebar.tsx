import React from "react";
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
import { useNavigate } from "react-router-dom";

const drawerWidth = 260;

export default function Sidebar() {
  const nav = useNavigate();
  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: 0,
          bgcolor: "#f6f1e7",
        },
      }}
    >
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
          onClick={() => nav("/")}
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
          onClick={() => nav("/farmers")}
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
    </Drawer>
  );
}
