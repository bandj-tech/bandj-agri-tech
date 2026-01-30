import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "./components/sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import FarmersList from "./pages/FarmersList"; 
import FarmerDetail from "./pages/FarmerDetail";

export default function App() {
  return (
    <Box display="flex" height="100vh" sx={{ bgcolor: "#f3ede2" }}>
      <Sidebar />
      <Box flex={1} display="flex" flexDirection="column">
        <Topbar />
        <Box component="main" p={{ xs: 2, md: 3 }} flex={1} overflow="auto">
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
