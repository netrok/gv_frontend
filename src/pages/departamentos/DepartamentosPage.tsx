import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Stack, TextField, Typography, useMediaQuery, useTheme
} from "@mui/material";
import { Close, Delete, Edit } from "@mui/icons-material";
import api from "../../lib/api";
import DepartamentoForm, { type DepartamentoFormValues } from "./DepartamentoForm";
import type { Departamento } from "../../types";
import { useToast } from "../../state/ToastContext";
import { useLocation, useNavigate } from "react-router-dom";

function normalize<T>(data:any): T[] { if (Array.isArray(data)) return data; if (data?.results) return data.results; return []; }

async function fetchDepartamentos(search: string) {
  const params:any = {}; if (search) params.search = search;
  const { data } = await api.get("/v1/departamentos/", { params });
  const rows = normalize<Departamento>(data);
  const total = Array.isArray(data) ? rows.length : data.count ?? rows.length;
  return { rows, total };
}

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 200 },
  { field: "clave", headerName: "Clave", width: 120 },
  { field: "activo", headerName: "Activo", type: "boolean", width: 100 },
  {
    field: "acciones",
    headerName: "Acciones",
    width: 130,
    sortable: false,
    filterable: false,
    renderCell: (params) => <RowActions id={params.row.id} />,
  },
];

function RowActions({ id }: { id: number }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este departamento?")) return;
    try {
      await api.delete(`/v1/departamentos/${id}/`);
      qc.invalidateQueries({ queryKey: ["departamentos"] });
      showToast("Departamento eliminado", "success");
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      <IconButton size="small" onClick={() => nav(`/departamentos/${id}/editar`)}><Edit fontSize="small" /></IconButton>
      <IconButton size="small" onClick={handleDelete} color="error"><Delete fontSize="small" /></IconButton>
    </Stack>
  );
}

export default function DepartamentosPage() {
  const [search, setSearch] = React.useState("");
  const { data, isLoading } = useQuery({ queryKey: ["departamentos", search], queryFn: () => fetchDepartamentos(search) });
  const qc = useQueryClient();
  const { showToast } = useToast();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const nav = useNavigate();
  const location = useLocation();

  // rutas modal
  const isCreateRoute = location.pathname.endsWith("/departamentos/nuevo");
  const matchEdit = location.pathname.match(/\/departamentos\/(\d+)\/editar$/);
  const editId = matchEdit ? Number(matchEdit[1]) : null;

  // allowed fields
  const allowedFieldsRef = React.useRef<Set<string> | null>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await api.options("/v1/departamentos/");
        const postFields = Object.keys(data?.actions?.POST ?? {});
        const putFields  = Object.keys(data?.actions?.PUT ?? data?.actions?.PATCH ?? {});
        const union = new Set<string>([...postFields, ...putFields]);
        allowedFieldsRef.current = union.size ? union : new Set(postFields);
      } catch {
        allowedFieldsRef.current = new Set(["nombre","clave","descripcion","activo"]);
      }
    })();
  }, []);
  const filterPayload = (v: DepartamentoFormValues) => {
    const s = allowedFieldsRef.current; if (!s) return v as any;
    const out:any = {}; for (const k of Object.keys(v)) if (s.has(k) && (v as any)[k] !== "") out[k]=(v as any)[k];
    return out;
  };

  // crear
  const [openCreate, setOpenCreate] = React.useState(isCreateRoute);
  React.useEffect(()=>setOpenCreate(isCreateRoute),[isCreateRoute]);
  const [savingCreate, setSavingCreate] = React.useState(false);
  const [createError, setCreateError] = React.useState<string|null>(null);
  const openCreateModal = () => nav("/departamentos/nuevo");
  const closeCreateModal = () => nav("/departamentos");
  const handleCreate = async (v: DepartamentoFormValues) => {
    setSavingCreate(true); setCreateError(null);
    try {
      await api.post("/v1/departamentos/", filterPayload(v));
      await qc.invalidateQueries({ queryKey: ["departamentos"] });
      showToast("Departamento creado", "success");
      closeCreateModal();
    } catch (e:any) {
      setCreateError(e?.response?.data ? JSON.stringify(e.response.data, null, 2) : String(e?.message || e));
      showToast("Error al crear", "error");
    } finally { setSavingCreate(false); }
  };

  // editar
  const [openEdit, setOpenEdit] = React.useState(!!editId);
  React.useEffect(()=>setOpenEdit(!!editId),[editId]);
  const [editData, setEditData] = React.useState<Departamento | null>(null);
  const [editLoading, setEditLoading] = React.useState(false);
  const [saveEditError, setSaveEditError] = React.useState<string|null>(null);
  React.useEffect(() => {
    let active = true;
    if (!editId) return;
    setEditLoading(true); setEditData(null);
    (async () => {
      try { const { data } = await api.get(`/v1/departamentos/${editId}/`); if (active) setEditData(data); }
      finally { if (active) setEditLoading(false); }
    })();
    return () => { active = false; };
  }, [editId]);
  const closeEditModal = () => nav("/departamentos");
  const [savingEdit, setSavingEdit] = React.useState(false);
  const handleUpdate = async (v: DepartamentoFormValues) => {
    if (!editId) return;
    setSavingEdit(true); setSaveEditError(null);
    try {
      await api.put(`/v1/departamentos/${editId}/`, filterPayload(v));
      await qc.invalidateQueries({ queryKey: ["departamentos"] });
      showToast("Cambios guardados", "success");
      closeEditModal();
    } catch (e:any) {
      setSaveEditError(e?.response?.data ? JSON.stringify(e.response.data, null, 2) : String(e?.message || e));
      showToast("Error al guardar", "error");
    } finally { setSavingEdit(false); }
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Departamentos</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" placeholder="Buscar" value={search} onChange={(e)=>setSearch(e.target.value)} />
            <Button variant="contained" onClick={openCreateModal}>Nuevo</Button>
          </Stack>
        </Stack>
        <Box sx={{ height: 520 }}>
          <DataGrid rows={data?.rows ?? []} columns={columns} loading={isLoading} getRowId={(r)=>r.id}
            pageSizeOptions={[10,25,50]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} />
        </Box>
      </Paper>

      <Dialog open={openCreate} onClose={closeCreateModal} fullWidth maxWidth="md" fullScreen={fullScreen}>
        <DialogTitle>Nuevo departamento</DialogTitle>
        <DialogContent dividers>
          <DepartamentoForm onSubmit={handleCreate} loading={savingCreate} error={createError} submitLabel="Crear" />
        </DialogContent>
        <DialogActions><Button startIcon={<Close />} onClick={closeCreateModal}>Cerrar</Button></DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={closeEditModal} fullWidth maxWidth="md" fullScreen={fullScreen}>
        <DialogTitle>Editar departamento</DialogTitle>
        <DialogContent dividers sx={{ minHeight: 160 }}>
          {editLoading && <Box sx={{ display:"grid", placeItems:"center", height: 160 }}><CircularProgress/></Box>}
          {!editLoading && editData && (
            <DepartamentoForm defaultValues={editData} onSubmit={handleUpdate} loading={savingEdit} error={saveEditError} submitLabel="Guardar cambios" />
          )}
        </DialogContent>
        <DialogActions><Button startIcon={<Close />} onClick={closeEditModal}>Cerrar</Button></DialogActions>
      </Dialog>
    </>
  );
}


