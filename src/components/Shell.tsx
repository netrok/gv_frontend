import React from "react";
import { Link, Outlet } from "react-router-dom";
import { AppBar, Box, Button, Container, Toolbar, Typography } from "@mui/material";
import { useAuth } from "../state/AuthContext";

const Shell: React.FC = () => {
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
          <Button onClick={logout} variant="contained">Salir</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Shell;
