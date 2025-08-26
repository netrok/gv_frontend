import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "./state/AuthContext";

import Shell from "./components/Shell";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import EmpleadosPage from "./pages/empleados/EmpleadosPage";
import DepartamentosPage from "./pages/departamentos/DepartamentosPage";
import PuestosPage from "./pages/puestos/PuestosPage";
import DebugAuth from "./pages/DebugAuth";

export default function App() {
  const { ready, isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    console.log("[AUTH]", { ready, isAuthenticated, user });
  }, [ready, isAuthenticated, user]);

  if (!ready) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="empleados" element={<EmpleadosPage />} />
        <Route path="empleados/nuevo" element={<EmpleadosPage />} />
        <Route path="empleados/:id/editar" element={<EmpleadosPage />} />
        <Route path="departamentos" element={<DepartamentosPage />} />
        <Route path="puestos" element={<PuestosPage />} />
        <Route path="debug" element={<DebugAuth />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
