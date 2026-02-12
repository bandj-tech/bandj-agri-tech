import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Sidebar from "./components/sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./pages/Dashboard";
import FarmersList from "./pages/FarmersList"; 
import FarmerDetail from "./pages/FarmerDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./contexts/AuthProvider";

function RequireAuth({ isAuthenticated }: { isAuthenticated: boolean }) {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout } = useAuth();

  return (
    <Box display="flex" height="100dvh" sx={{ bgcolor: "#f3ede2" }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box flex={1} minWidth={0} display="flex" flexDirection="column">
        <Topbar
          onMenuClick={() => setMobileOpen((open) => !open)}
          userEmail={user?.email}
          onLogout={logout}
        />
        <Box component="main" p={{ xs: 1.5, sm: 2, md: 3 }} flex={1} overflow="auto">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default function App() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Box minHeight="100dvh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

      <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/farmers" element={<FarmersList />} />
          <Route path="/farmers/:id" element={<FarmerDetail />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
