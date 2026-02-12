import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "./components/sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import FarmersList from "./pages/FarmersList"; 
import FarmerDetail from "./pages/FarmerDetail";

export default function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <Box display="flex" height="100dvh" sx={{ bgcolor: "#f3ede2" }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box flex={1} minWidth={0} display="flex" flexDirection="column">
        <Topbar onMenuClick={() => setMobileOpen((open) => !open)} />
        <Box component="main" p={{ xs: 1.5, sm: 2, md: 3 }} flex={1} overflow="auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/farmers" element={<FarmersList />} />
            <Route path="/farmers/:id" element={<FarmerDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}
