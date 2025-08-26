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
import PuestoForm, { type PuestoFormValues } from "../PuestoForm";
import type { Puesto } from "../../types";
import { useToast } from "../../state/ToastContext";
import { useLocation, useNavigate } from "react-router-dom";

function normalize<T>(data:any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return [];
}

async function fetchPuestos(search: string) {
  const params:any = {}; if (search) params.search = search;
  const { data } = await api.get("/v1/puestos/", { params });
  const rows = normalize<Puesto>(data);
  return { rows };
}

const columns: GridColDef<Puesto>[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 200 },
  { field: "clave", headerName: "Clave", width: 150 },
  {
    field: "departamento",
    headerName: "Departamento",
    width: 220,
    valueGetter: (_value, row) =>
      (row as any)?.departamento?.nombre ?? (row as any)?.departamento ?? "",
  },
  { field: "activo", headerName: "Activo", type: "boolean", width: 100 },
  {
    field: "acciones",
    headerName: "Acciones",
    width: 130,
    sortable: false,
    filterable: false,
    renderCell: (params) => <RowActions id={Number(params.id)} />,
  },
];

function RowActions({ id }: { id: number }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este puesto?")) return;
    try {
      await api.delete(`/v1/puestos/${id}/`);
      qc.invalidateQueries({ queryKey: ["puestos"] });
      showToast("Puesto eliminado", "success");
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      <IconButton size="small" onClick={() => nav(`/puestos/${id}/editar`)}>
        <Edit fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={handleDelete} color="error">
        <Delete fontSize="small" />
      </IconButton>
    </Stack>
  );
}

export default function PuestosPage() {
  const [search, setSearch] = React.useState("");
  const { data, isLoading } = useQuery({ queryKey: ["puestos", search], queryFn: () => fetchPuestos(search) });
  const qc = useQueryClient();
  const { showToast } = useToast();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const nav = useNavigate();
  const location = useLocation();

  const isCreateRoute = location.pathname.endsWith("/puestos/nuevo");
  const matchEdit = location.pathname.match(/\/puestos\/(\d+)\/editar$/);
  const editId = matchEdit ? Number(matchEdit[1]) : null;

  const allowedFieldsRef = React.useRef<Set<string> | null>(null);
  const [departamentoRequired, setDepartamentoRequired] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await api.options("/v1/puestos/");
        const postFields = Object.keys(data?.actions?.POST ?? {});
        const putFields  = Object.keys(data?.actions?.PUT ?? data?.actions?.PATCH ?? {});
        const union = new Set<string>([...postFields, ...putFields]);
        allowedFieldsRef.current = union.size ? union : new Set(postFields);
        const req = !!data?.actions?.POST?.departamento?.required;
        setDepartamentoRequired(req);
      } catch {
        allowedFieldsRef.current = new Set(["nombre","clave","descripcion","departamento"]);
        setDepartamentoRequired(false);
      }
    })();
  }, []);

  function filterPayload(v: PuestoFormValues) {
    const s = allowedFieldsRef.current;
    const base:any = {};
    for (const k of Object.keys(v)) {
      const val = (v as any)[k];
      if (!s || s.has(k)) {
        if (val !== "" && val !== undefined) base[k] = val;
      }
    }
    if (base.departamento !== undefined && base.departamento !== null) {
      const n = Number(base.departamento);
      if (!Number.isNaN(n)) base.departamento = n;
    }
    return base;
  }

  function toNestedDepartamento(payload:any) {
    if (payload && typeof payload.departamento === "number") {
      return { ...payload, departamento: { id: payload.departamento } };
    }
    return payload;
  }

  const [openCreate, setOpenCreate] = React.useState(isCreateRoute);
  React.useEffect(()=>setOpenCreate(isCreateRoute),[isCreateRoute]);
  const [savingCreate, setSavingCreate] = React.useState(false);
  const [createError, setCreateError] = React.useState<string|null>(null);
  const closeCreateModal = () => nav("/puestos");

  const handleCreate = async (v: PuestoFormValues) => {
    if (departamentoRequired && !v.departamento) {
      setCreateError("El campo 'departamento' es requerido.");
      showToast("Selecciona un departamento", "warning");
      return;
    }
    setSavingCreate(true); setCreateError(null);
    try {
      const payload = filterPayload(v);
      await api.post("/v1/puestos/", payload);
      await qc.invalidateQueries({ queryKey: ["puestos"] });
      showToast("Puesto creado", "success");
      closeCreateModal();
    } catch (e:any) {
      const data = e?.response?.data;
      const msg = data ? JSON.stringify(data, null, 2) : String(e?.message || e);
      const depErr = data?.departamento;
      const textDep = Array.isArray(depErr) ? depErr.join(" ") : (typeof depErr === "string" ? depErr : "");
      if (textDep && /dict|dictionary|objeto/i.test(textDep)) {
        try {
          const alt = toNestedDepartamento(filterPayload(v));
          await api.post("/v1/puestos/", alt);
          await qc.invalidateQueries({ queryKey: ["puestos"] });
          showToast("Puesto creado", "success");
          closeCreateModal();
          return;
        } catch (e2:any) {
          const data2 = e2?.response?.data;
          const msg2 = data2 ? JSON.stringify(data2, null, 2) : String(e2?.message || e2);
          setCreateError(msg2);
          showToast("Error al crear", "error");
        }
      } else {
        setCreateError(msg);
        showToast("Error al crear", "error");
      }
    } finally {
      setSavingCreate(false);
    }
  };

  const [openEdit, setOpenEdit] = React.useState(!!editId);
  React.useEffect(()=>setOpenEdit(!!editId),[editId]);
  const [editData, setEditData] = React.useState<Puesto | null>(null);
  const [editLoading, setEditLoading] = React.useState(false);
  const [saveEditError, setSaveEditError] = React.useState<string|null>(null);

  React.useEffect(() => {
    let active = true;
    if (!editId) return;
    setEditLoading(true); setEditData(null);
    (async () => {
      try { const { data } = await api.get(`/v1/puestos/${editId}/`); if (active) setEditData(data); }
      finally { if (active) setEditLoading(false); }
    })();
    return () => { active = false; };
  }, [editId]);

  const closeEditModal = () => nav("/puestos");
  const [savingEdit, setSavingEdit] = React.useState(false);

  const handleUpdate = async (v: PuestoFormValues) => {
    if (!editId) return;
    if (departamentoRequired && !v.departamento) {
      setSaveEditError("El campo 'departamento' es requerido.");
      showToast("Selecciona un departamento", "warning");
      return;
    }
    setSavingEdit(true); setSaveEditError(null);
    try {
      const payload = filterPayload(v);
      await api.put(`/v1/puestos/${editId}/`, payload);
      await qc.invalidateQueries({ queryKey: ["puestos"] });
      showToast("Cambios guardados", "success");
      closeEditModal();
    } catch (e:any) {
      const data = e?.response?.data;
      const msg = data ? JSON.stringify(data, null, 2) : String(e?.message || e);
      const depErr = data?.departamento;
      const textDep = Array.isArray(depErr) ? depErr.join(" ") : (typeof depErr === "string" ? depErr : "");
      if (textDep && /dict|dictionary|objeto/i.test(textDep)) {
        try {
          const alt = toNestedDepartamento(filterPayload(v));
          await api.put(`/v1/puestos/${editId}/`, alt);
          await qc.invalidateQueries({ queryKey: ["puestos"] });
          showToast("Cambios guardados", "success");
          closeEditModal();
          return;
        } catch (e2:any) {
          const data2 = e2?.response?.data;
          const msg2 = data2 ? JSON.stringify(data2, null, 2) : String(e2?.message || e2);
          setSaveEditError(msg2);
          showToast("Error al guardar", "error");
        }
      } else {
        setSaveEditError(msg);
        showToast("Error al guardar", "error");
      }
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Puestos</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" placeholder="Buscar…" value={search} onChange={(e)=>setSearch(e.target.value)} />
            <Button variant="contained" onClick={() => nav("/puestos/nuevo")}>Nuevo</Button>
          </Stack>
        </Stack>
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={data?.rows ?? []}
            columns={columns}
            loading={isLoading}
            getRowId={(r)=>r.id}
            pageSizeOptions={[10,25,50]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          />
        </Box>
      </Paper>

      {/* Crear */}
      <Dialog open={openCreate} onClose={() => nav("/puestos")} fullWidth maxWidth="md" fullScreen={fullScreen}>
        <DialogTitle>Nuevo puesto</DialogTitle>
        <DialogContent dividers>
          <PuestoForm
            onSubmit={handleCreate}
            loading={savingCreate}
            error={createError}
            submitLabel="Crear"
            requiredDepartamento={departamentoRequired}
          />
        </DialogContent>
        <DialogActions><Button startIcon={<Close />} onClick={() => nav("/puestos")}>Cerrar</Button></DialogActions>
      </Dialog>

      {/* Editar */}
      <Dialog open={openEdit} onClose={closeEditModal} fullWidth maxWidth="md" fullScreen={fullScreen}>
        <DialogTitle>Editar puesto</DialogTitle>
        <DialogContent dividers sx={{ minHeight: 160 }}>
          {editLoading && <Box sx={{ display:"grid", placeItems:"center", height: 160 }}><CircularProgress/></Box>}
          {!editLoading && editData && (
            <PuestoForm
              defaultValues={{
                ...editData,
                departamento: typeof editData.departamento === "number"
                  ? editData.departamento
                  : (editData as any)?.departamento?.id
              }}
              onSubmit={handleUpdate}
              loading={savingEdit}
              error={saveEditError}
              submitLabel="Guardar cambios"
              requiredDepartamento={departamentoRequired}
            />
          )}
        </DialogContent>
        <DialogActions><Button startIcon={<Close />} onClick={closeEditModal}>Cerrar</Button></DialogActions>
      </Dialog>
    </>
  );
}
