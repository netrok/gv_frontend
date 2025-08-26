import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import {
  Box, IconButton, Paper, Stack, TextField, Typography, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, useTheme, useMediaQuery,
  CircularProgress
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Delete, Edit, Close } from "@mui/icons-material";
import api from "../../lib/api";
import type { Empleado } from "../../types";
import EmpleadoForm from "./EmpleadoForm";
import type { EmpleadoFormValues } from "./EmpleadoForm";
import { useToast } from "../../state/ToastContext";
import { fetchEmpleadoChoices, coerceEmpleadoPayload } from "../../lib/choices";

function normalize<T>(data:any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return [];
}

async function fetchEmpleados(search: string) {
  const params: any = {}; if (search) params.search = search;
  const { data } = await api.get("/v1/empleados/", { params });
  const rows = normalize<Empleado>(data);
  const total = Array.isArray(data) ? rows.length : data.count ?? rows.length;
  return { rows, total };
}

const columns: GridColDef<Empleado>[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "num_empleado", headerName: "No.", width: 110 },
  { field: "nombres", headerName: "Nombres", width: 160 },
  { field: "apellido_paterno", headerName: "Apellido Paterno", width: 170 },
  { field: "apellido_materno", headerName: "Apellido Materno", width: 170 },
  {
    field: "puesto",
    headerName: "Puesto",
    width: 160,
    valueGetter: (_value, row) =>
      (row as any)?.puesto?.nombre ?? (row as any)?.puesto ?? "",
  },
  {
    field: "departamento",
    headerName: "Departamento",
    width: 180,
    valueGetter: (_value, row) =>
      (row as any)?.departamento?.nombre ?? (row as any)?.departamento ?? "",
  },
  { field: "fecha_ingreso", headerName: "Ingreso", width: 120 },
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
    if (!confirm("¿Eliminar este empleado?")) return;
    try {
      await api.delete(`/v1/empleados/${id}/`);
      qc.invalidateQueries({ queryKey: ["empleados"] });
      showToast("Empleado eliminado", "success");
      localStorage.removeItem(`empleado:edit:${id}`);
    } catch {
      showToast("Error al eliminar", "error");
    }
  };
  return (
    <Stack direction="row" spacing={1}>
      <IconButton size="small" onClick={() => nav(`/empleados/${id}/editar`)} aria-label="editar">
        <Edit fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={handleDelete} color="error" aria-label="eliminar">
        <Delete fontSize="small" />
      </IconButton>
    </Stack>
  );
}

const EmpleadosPage: React.FC = () => {
  const [search, setSearch] = React.useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["empleados", search],
    queryFn: () => fetchEmpleados(search),
  });

  const qc = useQueryClient();
  const nav = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // ====== Choices desde OPTIONS (para mapear estado_civil, genero, etc.)
  const choicesRef = React.useRef<Record<string, any[]>>({});
  React.useEffect(() => {
    (async () => {
      try {
        choicesRef.current = await fetchEmpleadoChoices();
      } catch {
        choicesRef.current = {}; // fallback
      }
    })();
  }, []);

  // ====== Modal Crear
  const isCreateRoute = location.pathname.endsWith("/empleados/nuevo");
  const [openCreate, setOpenCreate] = React.useState(isCreateRoute);
  React.useEffect(() => { setOpenCreate(isCreateRoute); }, [isCreateRoute]);

  const openCreateModal = () => nav("/empleados/nuevo");
  const closeCreateModal = () => nav("/empleados");

  // ====== Modal Editar
  const matchEdit = location.pathname.match(/\/empleados\/(\d+)\/editar$/);
  const editId = matchEdit ? Number(matchEdit[1]) : null;
  const isEditRoute = editId != null;
  const [openEdit, setOpenEdit] = React.useState(isEditRoute);
  React.useEffect(() => { setOpenEdit(isEditRoute); }, [isEditRoute]);

  const [editLoading, setEditLoading] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState<Empleado | null>(null);
  const closeEditModal = () => nav("/empleados");

  React.useEffect(() => {
    let active = true;
    if (!isEditRoute) return;
    setEditLoading(true);
    setEditError(null);
    setEditData(null);
    (async () => {
      try {
        const { data } = await api.get(`/v1/empleados/${editId}/`);
        if (active) setEditData(data);
      } catch (e:any) {
        if (active) setEditError(String(e?.message ?? e));
      } finally {
        if (active) setEditLoading(false);
      }
    })();
    return () => { active = false; };
  }, [isEditRoute, editId]);

  // ====== Campos permitidos (POST/PUT)
  const allowedFieldsRef = React.useRef<Set<string> | null>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await api.options("/v1/empleados/");
        const postFields = Object.keys(data?.actions?.POST ?? {});
        const putFields  = Object.keys(data?.actions?.PUT ?? data?.actions?.PATCH ?? {});
        const union = new Set<string>([...postFields, ...putFields]);
        allowedFieldsRef.current = union.size ? union : new Set(postFields);
      } catch {
        allowedFieldsRef.current = new Set([
          "num_empleado","nombres","apellido_paterno","apellido_materno",
          "departamento","puesto","fecha_ingreso","activo","email",
          "genero","estado_civil","contrato","jornada","turno"
        ]);
      }
    })();
  }, []);

  function filterPayloadForBackend(values: EmpleadoFormValues) {
    // 1) Mapear texto del usuario a los códigos/values que espera el back (choices)
    const coerced = coerceEmpleadoPayload(values as any, choicesRef.current);

    // 2) Filtrar por campos permitidos
    const set = allowedFieldsRef.current;
    const base = { ...coerced, departamento: coerced.departamento, puesto: coerced.puesto };
    if (!set) return base;
    const out: any = {};
    for (const k of Object.keys(base)) {
      if (set.has(k) && base[k] !== "" && base[k] !== undefined) out[k] = base[k];
    }
    return out;
  }

  // ====== Crear
  const [savingCreate, setSavingCreate] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const handleCreate = async (values: EmpleadoFormValues) => {
    setSavingCreate(true); setCreateError(null);
    try{
      const payload = filterPayloadForBackend(values);
      await api.post("/v1/empleados/", payload);
      await qc.invalidateQueries({ queryKey: ["empleados"] });
      showToast("Empleado creado", "success");
      localStorage.removeItem("empleado:create");
      closeCreateModal();
    }catch(e:any){
      const msg = e?.response?.data ? JSON.stringify(e.response.data, null, 2) : String(e?.message || e);
      setCreateError(msg);
      showToast("Error al crear", "error");
    }finally{
      setSavingCreate(false);
    }
  };

  // ====== Editar
  const [savingEdit, setSavingEdit] = React.useState(false);
  const [saveEditError, setSaveEditError] = React.useState<string | null>(null);
  const handleUpdate = async (values: EmpleadoFormValues) => {
    if (!editId) return;
    setSavingEdit(true); setSaveEditError(null);
    try{
      const payload = filterPayloadForBackend(values);
      await api.put(`/v1/empleados/${editId}/`, payload);
      await qc.invalidateQueries({ queryKey: ["empleados"] });
      showToast("Cambios guardados", "success");
      localStorage.removeItem(`empleado:edit:${editId}`);
      closeEditModal();
    }catch(e:any){
      const msg = e?.response?.data ? JSON.stringify(e.response.data, null, 2) : String(e?.message || e);
      setSaveEditError(msg);
      showToast("Error al guardar", "error");
    }finally{
      setSavingEdit(false);
    }
  };

  //  Modal XL y responsive
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>Empleados</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" placeholder="Buscar" value={search} onChange={(e)=>setSearch(e.target.value)} />
            <Button variant="contained" onClick={openCreateModal}>Nuevo</Button>
          </Stack>
        </Stack>
        {error && <Typography color="error" sx={{ mb: 1 }}>Error cargando empleados</Typography>}
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={data?.rows ?? []}
            columns={columns}
            loading={isLoading}
            getRowId={(r) => r.id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          />
        </Box>
      </Paper>

      {/* ===== Modal Crear ===== */}
      <Dialog
        open={openCreate}
        onClose={closeCreateModal}
        fullWidth
        maxWidth="xl"
        fullScreen={fullScreen}
        PaperProps={{ sx: { width: { xs: "100vw", md: "90vw", lg: "85vw" } } }}
      >
        <DialogTitle>Nuevo empleado</DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1, sm: 2 } }}>
          <EmpleadoForm
            onSubmit={handleCreate}
            loading={savingCreate}
            error={createError}
            submitLabel="Crear"
            wrapInPaper={false}
          />
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Close />} onClick={closeCreateModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* ===== Modal Editar ===== */}
      <Dialog
        open={openEdit}
        onClose={closeEditModal}
        fullWidth
        maxWidth="xl"
        fullScreen={fullScreen}
        PaperProps={{ sx: { width: { xs: "100vw", md: "90vw", lg: "85vw" } } }}
      >
        <DialogTitle>
          {editLoading ? "Cargando" : editData ? `Editar: ${editData.nombres} ${editData.apellido_paterno ?? ""}` : "Editar empleado"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1, sm: 2 }, minHeight: 200 }}>
          {editLoading && (
            <Box sx={{ display:"grid", placeItems:"center", height: 200 }}>
              <CircularProgress />
            </Box>
          )}
          {!editLoading && editData && (
            <EmpleadoForm
              defaultValues={editData}
              onSubmit={handleUpdate}
              loading={savingEdit}
              error={saveEditError}
              submitLabel="Guardar cambios"
              wrapInPaper={false}
            />
          )}
          {!editLoading && !editData && editError && (
            <Typography color="error">{editError}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Close />} onClick={closeEditModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmpleadosPage;

