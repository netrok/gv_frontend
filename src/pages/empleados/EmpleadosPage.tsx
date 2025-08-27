import React from "react";
import { Box, Paper, Stack, Typography, useMediaQuery, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { useToast } from "../../state/ToastContext";
import EmpleadosTable from "./EmpleadosTable";
import EmpleadoForm from "./EmpleadoForm";
import type { EmpleadoFormValues } from "./EmpleadoForm";

import EmpleadosToolbar from "../../features/empleados/components/EmpleadosToolbar";
import EmpleadoViewDialog from "../../features/empleados/components/EmpleadoViewDialog";
import { useCatalogos } from "../../features/empleados/hooks/useCatalogos";
import { exportEmpleadosCsv } from "../../features/empleados/export/csv";
import { exportEmpleadosPdf } from "../../features/empleados/export/pdf";

export default function EmpleadosPage() {
  const [search, setSearch] = React.useState("");
  const nav = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const { showToast } = useToast();

  const { puestoMap, dptoMap } = useCatalogos();

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

  /* ===== Ver ===== */
  const [openView, setOpenView] = React.useState(false);
  const [viewId, setViewId] = React.useState<number | string | null>(null);
  const handleView = (id: number | string) => { setViewId(id); setOpenView(true); };
  const closeViewModal = () => { setOpenView(false); setViewId(null); };

  /* ===== Export ===== */
  const handleExportCsv = async () => {
    try {
      await exportEmpleadosCsv(search, puestoMap, dptoMap);
      showToast("CSV exportado", "success");
    } catch {
      showToast("Error al exportar", "error");
    }
  };
  const handleExportPdf = async () => {
    try {
      await exportEmpleadosPdf(search, puestoMap, dptoMap);
      showToast("PDF exportado", "success");
    } catch {
      showToast("Error al exportar PDF", "error");
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
          <EmpleadosToolbar
            search={search}
            onSearchChange={setSearch}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
            onNew={openCreateModal}
          />
        </Stack>
      </Paper>

      <EmpleadosTable
        search={search}
        pageSize={25}
        onView={(id) => handleView(id)}
        onEdit={(id) => nav(`/empleados/${id}/editar`)}
        onDelete={(id) => handleDelete(id)}
      />

      {/* Ver */}
      <EmpleadoViewDialog
        open={openView}
        empleadoId={viewId}
        onClose={closeViewModal}
        onEdit={(id) => nav(`/empleados/${id}/editar`)}
        puestoMap={puestoMap}
        dptoMap={dptoMap}
      />

      {/* Crear */}
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

      {/* Editar */}
      <Dialog open={openEdit} onClose={closeEditModal} fullWidth maxWidth="xl" fullScreen={fullScreen}
        PaperProps={{ sx: { width: { xs: "100vw", md: "90vw", lg: "85vw" } } }}>
        <DialogTitle>
          {editLoading ? "Cargando" : editData ? `Editar: ${editData.nombres ?? ""} ${editData.apellido_paterno ?? ""}` : "Editar empleado"}
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
          {!editLoading && !editData && saveEditError && <Box color="error.main">{saveEditError}</Box>}
          {editLoading && <Box sx={{ display: "grid", placeItems: "center", height: 200 }}>Cargando…</Box>}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Close />} onClick={closeEditModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
