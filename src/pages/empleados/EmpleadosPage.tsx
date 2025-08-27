import React from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Paper, Stack, TextField, Typography, useMediaQuery, useTheme, Chip, Grid
} from "@mui/material";
import { Close, Edit as EditIcon } from "@mui/icons-material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { useToast } from "../../state/ToastContext";
import EmpleadosTable from "./EmpleadosTable";
import EmpleadoForm from "./EmpleadoForm";
import type { EmpleadoFormValues } from "./EmpleadoForm";

/* helpers locales */
const toTitle = (s?: string) =>
  (s ?? "")
    .toLowerCase()
    .replace(/\b([a-záéíóúñü]+)\b/gi, (w) =>
      /^(de|del|la|las|los|y|o)$/.test(w) ? w : w[0].toUpperCase() + w.slice(1)
    );
const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("es-MX", { year: "numeric", month: "2-digit", day: "2-digit" }) : "";

/* helpers para catálogos + export */
const getList = (resp: any) =>
  Array.isArray(resp) ? resp
  : Array.isArray(resp?.data) ? resp.data
  : Array.isArray(resp?.results) ? resp.results
  : [];
const toMap = (arr: any[], key = "id", label = "nombre") =>
  Object.fromEntries(arr.map((x) => [String(x?.[key]), x?.[label] ?? "—"]));
const csvEscape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const downloadFile = (name: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
};

export default function EmpleadosPage() {
  const [search, setSearch] = React.useState("");
  const nav = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const { showToast } = useToast();

  /* ===== Crear ===== */
  const isCreateRoute = location.pathname.endsWith("/empleados/nuevo");
  const [openCreate, setOpenCreate] = React.useState(isCreateRoute);
  React.useEffect(() => { setOpenCreate(isCreateRoute); }, [isCreateRoute]);
  const openCreateModal = () => nav("/empleados/nuevo");
  const closeCreateModal = () => nav("/empleados");

  const [savingCreate, setSavingCreate] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const handleCreate = async (values: EmpleadoFormValues) => {
    setSavingCreate(true); setCreateError(null);
    try {
      await api.post("/v1/empleados/", values as any);
      await qc.invalidateQueries({ queryKey: ["empleados"] });
      showToast("Empleado creado", "success");
      closeCreateModal();
    } catch (e: any) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data, null, 2) : String(e?.message || e);
      setCreateError(msg);
      showToast("Error al crear", "error");
    } finally {
      setSavingCreate(false);
    }
  };

  /* ===== Editar ===== */
  const matchEdit = location.pathname.match(/\/empleados\/(\d+)\/editar$/);
  const editId = matchEdit ? Number(matchEdit[1]) : null;
  const isEditRoute = editId != null;
  const [openEdit, setOpenEdit] = React.useState(isEditRoute);
  React.useEffect(() => { setOpenEdit(isEditRoute); }, [isEditRoute]);
  const closeEditModal = () => nav("/empleados");

  const [savingEdit, setSavingEdit] = React.useState(false);
  const [saveEditError, setSaveEditError] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState<any>(null);
  const [editLoading, setEditLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    if (!isEditRoute) return;
    setEditLoading(true); setEditData(null); setSaveEditError(null);
    (async () => {
      try {
        const { data } = await api.get(`/v1/empleados/${editId}/`);
        if (active) setEditData(data);
      } catch (e: any) {
        if (active) setSaveEditError(String(e?.message ?? e));
      } finally {
        if (active) setEditLoading(false);
      }
    })();
    return () => { active = false; };
  }, [isEditRoute, editId]);

  const handleUpdate = async (values: EmpleadoFormValues) => {
    if (!editId) return;
    setSavingEdit(true); setSaveEditError(null);
    try {
      await api.put(`/v1/empleados/${editId}/`, values as any);
      await qc.invalidateQueries({ queryKey: ["empleados"] });
      showToast("Cambios guardados", "success");
      closeEditModal();
    } catch (e: any) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data, null, 2) : String(e?.message || e);
      setSaveEditError(msg);
      showToast("Error al guardar", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  /* ===== Eliminar ===== */
  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Eliminar este empleado?")) return;
    try {
      await api.delete(`/v1/empleados/${id}/`);
      await qc.invalidateQueries({ queryKey: ["empleados"] });
      showToast("Empleado eliminado", "success");
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  /* ===== Ver (MODAL) ===== */
  const [openView, setOpenView] = React.useState(false);
  const [viewId, setViewId] = React.useState<number | string | null>(null);
  const [viewData, setViewData] = React.useState<any>(null);
  const [viewLoading, setViewLoading] = React.useState(false);
  const [viewError, setViewError] = React.useState<string | null>(null);

  const handleView = (id: number | string) => {
    setViewId(id);
    setOpenView(true);
  };
  React.useEffect(() => {
    let active = true;
    if (!openView || viewId == null) return;
    setViewLoading(true); setViewError(null); setViewData(null);
    (async () => {
      try {
        // intentamos expandir relaciones si el backend lo soporta
        const { data } = await api.get(`/v1/empleados/${viewId}/`, {
          params: { expand: "puesto,departamento" },
        });
        if (active) setViewData(data);
      } catch (e: any) {
        if (active) setViewError(String(e?.message ?? e));
      } finally {
        if (active) setViewLoading(false);
      }
    })();
    return () => { active = false; };
  }, [openView, viewId]);

  const closeViewModal = () => {
    setOpenView(false);
    setViewId(null);
    setViewData(null);
    setViewError(null);
  };

  /* ===== Catálogos para traducir IDs -> nombres (para el modal Ver y export) ===== */
  const { data: puestosResp } = useQuery({
    queryKey: ["puestos", "map"],
    queryFn: async () => (await api.get("/v1/puestos?per_page=1000")).data,
  });
  const { data: dptosResp } = useQuery({
    queryKey: ["departamentos", "map"],
    queryFn: async () => (await api.get("/v1/departamentos?per_page=1000")).data,
  });
  const puestoMap = React.useMemo(() => toMap(getList(puestosResp)), [puestosResp]);
  const dptoMap   = React.useMemo(() => toMap(getList(dptosResp)),   [dptosResp]);

  // Etiquetas resueltas para el modal
  const puestoLabel = viewData?.puesto?.nombre
    ?? puestoMap[String(viewData?.puesto_id ?? viewData?.puesto)]
    ?? "—";
  const dptoLabel = viewData?.departamento?.nombre
    ?? dptoMap[String(viewData?.departamento_id ?? viewData?.departamento)]
    ?? "—";

  /* ===== Exportar CSV ===== */
  const handleExportCsv = async () => {
    try {
      const params: Record<string, any> = { per_page: 1000 };
      if (search) params.search = search;
      const { data } = await api.get("/v1/empleados/", { params });
      const list = getList(data);

      const header = [
        "ID","No.","Nombres","Apellido Paterno","Apellido Materno",
        "Puesto","Departamento","Ingreso","Activo","Email"
      ];
      const lines = list.map((r: any) => {
        const puesto = r?.puesto?.nombre ?? puestoMap[String(r?.puesto_id ?? r?.puesto)] ?? "";
        const dpto   = r?.departamento?.nombre ?? dptoMap[String(r?.departamento_id ?? r?.departamento)] ?? "";
        const fecha  = fmtDate(r?.fecha_ingreso ?? r?.ingreso);
        const activo = r?.activo ? "Activo" : "Inactivo";
        return [
          r?.id ?? "",
          r?.num_empleado ?? "",
          toTitle(r?.nombres ?? r?.nombre ?? ""),
          toTitle(r?.apellido_paterno ?? ""),
          toTitle(r?.apellido_materno ?? ""),
          puesto,
          dpto,
          fecha,
          activo,
          r?.email ?? "",
        ].map(csvEscape).join(",");
      });
      const csv = [header.map(csvEscape).join(","), ...lines].join("\r\n");
      // BOM para Excel
      const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
      downloadFile(`empleados_${new Date().toISOString().slice(0,10)}.csv`, blob);
      showToast("CSV exportado", "success");
    } catch {
      showToast("Error al exportar", "error");
    }
  };

  /* Responsive modal */
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>Empleados</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button startIcon={<FileDownloadIcon />} variant="outlined" onClick={handleExportCsv}>
              Exportar CSV
            </Button>
            <Button variant="contained" onClick={openCreateModal}>Nuevo</Button>
          </Stack>
        </Stack>
      </Paper>

      <EmpleadosTable
        search={search}
        pageSize={25}
        onView={(id) => handleView(id)}
        onEdit={(id) => nav(`/empleados/${id}/editar`)}
        onDelete={(id) => handleDelete(id)}
      />

      {/* ===== Modal Ver ===== */}
      <Dialog
        open={openView}
        onClose={closeViewModal}
        fullWidth
        maxWidth="md"
        fullScreen={fullScreen}
      >
        <DialogTitle>
          {viewLoading ? "Cargando…" : viewData ? `Empleado: ${toTitle(viewData.nombres ?? "")} ${toTitle(viewData.apellido_paterno ?? "")}` : "Empleado"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1, sm: 2 } }}>
          {viewLoading && <Box sx={{ display: "grid", placeItems: "center", height: 160 }}>Cargando…</Box>}
          {!viewLoading && viewError && <Typography color="error">{viewError}</Typography>}
          {!viewLoading && viewData && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">No. Empleado</Typography>
                <Typography variant="body1">{viewData.num_empleado ?? "—"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Activo</Typography>
                <Chip
                  label={(viewData.activo ? "Activo" : "Inactivo")}
                  color={viewData.activo ? "success" : "default"}
                  size="small"
                  variant={viewData.activo ? "filled" : "outlined"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Nombres</Typography>
                <Typography variant="body1">{toTitle(viewData.nombres ?? viewData.nombre ?? "")}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Apellidos</Typography>
                <Typography variant="body1">{toTitle(`${viewData.apellido_paterno ?? ""} ${viewData.apellido_materno ?? ""}`.trim())}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Puesto</Typography>
                <Typography variant="body1">{puestoLabel}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Departamento</Typography>
                <Typography variant="body1">{dptoLabel}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Ingreso</Typography>
                <Typography variant="body1">{fmtDate(viewData.fecha_ingreso ?? viewData.ingreso)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{viewData.email ?? "—"}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {viewData && (
            <Button
              startIcon={<EditIcon />}
              onClick={() => {
                closeViewModal();
                nav(`/empleados/${viewData.id}/editar`);
              }}
            >
              Editar
            </Button>
          )}
          <Button startIcon={<Close />} onClick={closeViewModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* ===== Modal Crear ===== */}
      <Dialog open={openCreate} onClose={closeCreateModal} fullWidth maxWidth="xl" fullScreen={fullScreen}
        PaperProps={{ sx: { width: { xs: "100vw", md: "90vw", lg: "85vw" } } }}>
        <DialogTitle>Nuevo empleado</DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1, sm: 2 } }}>
          <EmpleadoForm onSubmit={handleCreate} loading={savingCreate} error={createError} submitLabel="Crear" wrapInPaper={false} />
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Close />} onClick={closeCreateModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* ===== Modal Editar ===== */}
      <Dialog open={openEdit} onClose={closeEditModal} fullWidth maxWidth="xl" fullScreen={fullScreen}
        PaperProps={{ sx: { width: { xs: "100vw", md: "90vw", lg: "85vw" } } }}>
        <DialogTitle>
          {editLoading ? "Cargando" : editData ? `Editar: ${toTitle(editData.nombres ?? "")} ${toTitle(editData.apellido_paterno ?? "")}` : "Editar empleado"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1, sm: 2 }, minHeight: 200 }}>
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
          {!editLoading && !editData && saveEditError && <Typography color="error">{saveEditError}</Typography>}
          {editLoading && <Box sx={{ display: "grid", placeItems: "center", height: 200 }}>Cargando…</Box>}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Close />} onClick={closeEditModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
