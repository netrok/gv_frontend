// src/pages/EmpleadosPage.tsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box, Paper, Typography } from "@mui/material";
import api from "../lib/api";              // ⬅️ corrige la ruta (antes ../../lib/api)
import type { Empleado } from "../types";  // ⬅️ type-only import por verbatimModuleSyntax

// Si tu API devuelve {count, next, previous, results}, normalizamos a array
const fetchEmpleados = async (): Promise<Empleado[]> => {
  const { data } = await api.get("/v1/empleados/");
  if (Array.isArray(data)) return data as Empleado[];
  if (Array.isArray(data?.results)) return data.results as Empleado[];
  return [];
};

// Define columnas (usa "_" para parámetros no usados y evitar warnings)
const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "num_empleado", headerName: "No.", width: 100 },
  { field: "nombres", headerName: "Nombres", width: 160 },
  { field: "apellido_paterno", headerName: "Apellido Paterno", width: 160 },
  { field: "apellido_materno", headerName: "Apellido Materno", width: 160 },
  {
    field: "puesto",
    headerName: "Puesto",
    width: 160,
    valueGetter: (_value, row: any) => row?.puesto?.nombre ?? row?.puesto ?? "",
  },
  {
    field: "departamento",
    headerName: "Departamento",
    width: 180,
    valueGetter: (_value, row: any) => row?.departamento?.nombre ?? row?.departamento ?? "",
  },
  { field: "fecha_ingreso", headerName: "Ingreso", width: 120 },
  { field: "activo", headerName: "Activo", width: 100, type: "boolean" },
];

const EmpleadosPage: React.FC = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["empleados"],
    queryFn: fetchEmpleados,
  });

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Empleados
      </Typography>
      <Box sx={{ height: 560 }}>
        <DataGrid
          rows={data as Empleado[]}
          columns={columns}
          loading={isLoading}
          getRowId={(r) => (r as any).id}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      </Box>
    </Paper>
  );
};

export default EmpleadosPage;
