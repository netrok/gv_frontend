import React from "react";
import { Paper, Typography } from "@mui/material";
const EmpleadosPage: React.FC = () => (
  <Paper sx={{ p: 2 }}>
    <Typography variant="h6" fontWeight={700}>Empleados (stub)</Typography>
    <Typography sx={{ mt: 1 }}>Aquí pondremos el DataGrid en el siguiente paso.</Typography>
  </Paper>
);
export default EmpleadosPage;
