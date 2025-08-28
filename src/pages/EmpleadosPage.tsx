// src/pages/EmpleadosPage.tsx
import { useQuery } from "@tanstack/react-query";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Box, Paper, Typography } from "@mui/material";
import api from "../lib/api";
import type { Empleado } from "../types";

// Normaliza la respuesta
const fetchEmpleados = async (): Promise<Empleado[]> => {
  const { data } = await api.get("/v1/empleados/");
  if (Array.isArray(data)) return data as Empleado[];
  if (Array.isArray(data?.results)) return data.results as Empleado[];
  return [];
};

// 👉 SIN "id" ni "fecha_ingreso"
const columns: GridColDef[] = [
  { field: "num_empleado", headerName: "No.", width: 100 },
  { field: "nombres", headerName: "Nombres", width: 160 },
  { field: "apellido_paterno", headerName: "Apellido Paterno", width: 160 },
  { field: "apellido_materno", headerName: "Apellido Materno", width: 160 },
  {
    field: "puesto",
    headerName: "Puesto",
    width: 160,
    valueGetter: (_v, row: any) => row?.puesto?.nombre ?? row?.puesto ?? "",
  },
  {
    field: "departamento",
    headerName: "Departamento",
    width: 180,
    valueGetter: (_v, row: any) => row?.departamento?.nombre ?? row?.departamento ?? "",
  },
  { field: "activo", headerName: "Activo", width: 100, type: "boolean" },
];

export default function EmpleadosPage() {
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
          getRowId={(r) => (r as any).id} // se sigue usando internamente
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      </Box>
    </Paper>
  );
}
