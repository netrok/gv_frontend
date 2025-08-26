import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import EmpleadosPage from "./pages/empleados/EmpleadosPage";
import DepartamentosPage from "./pages/departamentos/DepartamentosPage";
import PuestosPage from "./pages/puestos/PuestosPage";
import { useAuth } from "./state/AuthContext";
import DebugAuth from "./pages/DebugAuth";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { user, logout, debug } = useAuth();
  return (
    <Box sx={{ minHeight: "100dvh" }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>GV  RH</Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.85 }}>
            {user ? `Usuario: ${user.username}` : "No autenticado"} | API: {debug.apiUrl}{debug.mePath ? ` (${debug.mePath})` : ""}
            {debug.lastError ? `  me err: ${debug.lastError}` : ""}
          </Typography>
          <Button component={Link} to="/" color="inherit">Dashboard</Button>
          <Button component={Link} to="/empleados" color="inherit">Empleados</Button>
          <Button component={Link} to="/departamentos" color="inherit">Departamentos</Button>
          <Button component={Link} to="/puestos" color="inherit">Puestos</Button>
          <Button component={Link} to="/debug" color="inherit">Debug</Button>
          {user ? (
            <Button onClick={logout} variant="contained">Salir</Button>
          ) : (
            <Button component={Link} to="/login" variant="contained">Login</Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/debug" element={<DebugAuth />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/empleados" element={<ProtectedRoute><EmpleadosPage /></ProtectedRoute>} />
          <Route path="/departamentos" element={<ProtectedRoute><DepartamentosPage /></ProtectedRoute>} />
          <Route path="/puestos" element={<ProtectedRoute><PuestosPage /></ProtectedRoute>} />
          <Route path="*" element={<div style={{padding:16}}>No encontrado</div>} />
        </Routes>
      </Container>
    </Box>
  );
}
