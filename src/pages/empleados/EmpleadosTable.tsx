// src/pages/empleados/EmpleadosTable.tsx
import * as React from "react";
import { Box, Chip, IconButton, Stack } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";

/* ---------- helpers ---------- */
const toTitle = (s?: string) =>
  (s ?? "")
    .toLowerCase()
    .replace(/\b([a-záéíóúñü]+)\b/gi, (w) =>
      /^(de|del|la|las|los|y|o)$/.test(w) ? w : w[0].toUpperCase() + w.slice(1)
    );

const getList = (resp: any) =>
  Array.isArray(resp) ? resp
  : Array.isArray(resp?.data) ? resp.data
  : Array.isArray(resp?.results) ? resp.results
  : [];

const toMap = (arr: any[], key = "id", label = "nombre") =>
  Object.fromEntries(arr.map((x) => [String(x?.[key]), x?.[label] ?? "—"]));

const pick = (obj: any, keys: string[], fallback: any = "") => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
};

const toBool = (v: any) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.toLowerCase();
    return s === "true" || s === "1" || s === "s" || s === "si" || s === "sí";
  }
  return false;
};

/* ---------- props del componente ---------- */
export type EmpleadosTableProps = {
  search?: string;
  pageSize?: number;
  onView?: (id: number | string, row: any) => void;
  onEdit?: (id: number | string, row: any) => void | Promise<void>;
  onDelete?: (id: number | string, row: any) => void | Promise<void>;
};

/* ---------- componente ---------- */
const EmpleadosTable: React.FC<EmpleadosTableProps> = ({
  search = "",
  pageSize = 25,
  onView,
  onEdit,
  onDelete,
}) => {
  // catálogos
  const { data: puestosResp } = useQuery({
    queryKey: ["puestos"],
    queryFn: async () => (await api.get("/v1/puestos?per_page=1000")).data,
  });
  const { data: dptosResp } = useQuery({
    queryKey: ["departamentos"],
    queryFn: async () => (await api.get("/v1/departamentos?per_page=1000")).data,
  });

  const puestoMap = React.useMemo(() => toMap(getList(puestosResp)), [puestosResp]);
  const dptoMap   = React.useMemo(() => toMap(getList(dptosResp)),   [dptosResp]);

  // empleados (filtrado por search)
  const { data: empleadosResp, isLoading } = useQuery({
    queryKey: ["empleados", "index", search],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (search) params.search = search;
      const { data } = await api.get("/v1/empleados/", { params });
      return data;
    },
  });

  const rows = React.useMemo(() => getList(empleadosResp), [empleadosResp]);

  // SIN columnas "ID" ni "Ingreso"
  const cols = React.useMemo<GridColDef[]>(() => [
    { field: "num_empleado", headerName: "No.", width: 110 },

    {
      field: "nombres",
      headerName: "Nombres",
      minWidth: 160,
      valueGetter: (_value: any, row: any) =>
        toTitle(String(pick(row, ["nombres", "nombre", "first_name", "primer_nombre"], ""))),
    },
    {
      field: "apellido_paterno",
      headerName: "Apellido Paterno",
      minWidth: 160,
      valueGetter: (_: any, row: any) =>
        toTitle(String(pick(row, ["apellido_paterno", "primer_apellido", "apellidoPaterno", "paterno"], ""))),
    },
    {
      field: "apellido_materno",
      headerName: "Apellido Materno",
      minWidth: 160,
      valueGetter: (_: any, row: any) =>
        toTitle(String(pick(row, ["apellido_materno", "segundo_apellido", "apellidoMaterno", "materno"], ""))),
    },

    {
      field: "puesto",
      headerName: "Puesto",
      minWidth: 180,
      valueGetter: (_: any, row: any) => {
        const emb = row?.puesto;
        if (emb && typeof emb === "object") return emb?.nombre ?? "—";
        const id = pick(row, ["puesto_id", "puestoId", "id_puesto", "puesto"], null);
        return id != null ? (puestoMap[String(id)] ?? String(id)) : "—";
      },
    },
    {
      field: "departamento",
      headerName: "Departamento",
      minWidth: 180,
      valueGetter: (_: any, row: any) => {
        const emb = row?.departamento;
        if (emb && typeof emb === "object") return emb?.nombre ?? "—";
        const id = pick(row, ["departamento_id", "departamentoId", "id_departamento", "departamento"], null);
        return id != null ? (dptoMap[String(id)] ?? String(id)) : "—";
      },
    },
    {
      field: "activo",
      headerName: "Activo",
      width: 110,
      valueGetter: (_: any, row: any) => toBool(pick(row, ["activo", "is_active", "estatus", "status"], false)),
      renderCell: (p: any) => (
        <Chip
          label={p.value ? "Activo" : "Inactivo"}
          size="small"
          color={p.value ? "success" : "default"}
          variant={p.value ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (p: any) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            aria-label="ver"
            onClick={() => onView?.(p.id, p.row)}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="editar"
            onClick={() => onEdit?.(p.id, p.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            aria-label="eliminar"
            color="error"
            onClick={() => onDelete?.(p.id, p.row)}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ], [puestoMap, dptoMap, onView, onEdit, onDelete]);

  return (
    <Box sx={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={cols}
        loading={isLoading}
        getRowId={(r: any) => r.id ?? r.ID ?? r.uuid ?? r.num_empleado ?? r.clave}
        initialState={{
          pagination: { paginationModel: { pageSize, page: 0 } },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        disableColumnMenu={false}
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
      />
    </Box>
  );
};

export default EmpleadosTable;
