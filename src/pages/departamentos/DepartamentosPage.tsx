// src/pages/departamentos/DepartamentosPage.tsx
import React from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../state/ToastContext";
import api from "../../lib/api";

import DepartamentosToolbar from "../../features/departamentos/components/DepartamentosToolbar";
import { downloadDepartamentosXlsx } from "../../features/departamentos/export/excel";

import DepartamentoForm, { type DepartamentoFormValues } from "./DepartamentoForm";
import DepartamentosTable from "../../features/departamentos/components/DepartamentosTable";

export default function DepartamentosPage() {
  const [search, setSearch] = React.useState("");
  const [exporting, setExporting] = React.useState(false);

  const nav = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const { showToast } = useToast();

  // ===== Crear
  const isCreateRoute = location.pathname.endsWith("/departamentos/nuevo");
  const [openCreate, setOpenCreate] = React.useState(isCreateRoute);
  React.useEffect(() => setOpenCreate(isCreateRoute), [isCreateRoute]);
  const openCreateModal = () => nav("/departamentos/nuevo");
  const closeCreateModal = () => nav("/departamentos");

  const [savingCreate, setSavingCreate] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  const handleCreate = async (values: DepartamentoFormValues) => {
    setSavingCreate(true);
    setCreateError(null);
    try {
      await api.post("/v1/departamentos/", values);
      await qc.invalidateQueries({ queryKey: ["departamentos"] });
      showToast("Departamento creado", "success");
      closeCreateModal();
    } catch (e: any) {
      const msg = e?.response?.data
        ? JSON.stringify(e.response.data, null, 2)
        : String(e?.message || e);
      setCreateError(msg);
      showToast("Error al crear", "error");
    } finally {
      setSavingCreate(false);
    }
  };

  // ===== Editar
  const matchEdit = location.pathname.match(/\/departamentos\/(\d+)\/editar$/);
  const editId = matchEdit ? Number(matchEdit[1]) : null;
  const isEditRoute = editId != null;

  const [openEdit, setOpenEdit] = React.useState(isEditRoute);
  React.useEffect(() => setOpenEdit(isEditRoute), [isEditRoute]);
  const closeEditModal = () => nav("/departamentos");

  const [savingEdit, setSavingEdit] = React.useState(false);
  const [saveEditError, setSaveEditError] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState<any>(null);
  const [editLoading, setEditLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    if (!isEditRoute) return;
    setEditLoading(true);
    setEditData(null);
    setSaveEditError(null);
    (async () => {
      try {
        const { data } = await api.get(`/v1/departamentos/${editId}/`);
        if (active) setEditData(data);
      } catch (e: any) {
        if (active) setSaveEditError(String(e?.message ?? e));
      } finally {
        if (active) setEditLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEditRoute, editId]);

  const handleUpdate = async (values: DepartamentoFormValues) => {
    if (!editId) return;
    setSavingEdit(true);
    setSaveEditError(null);
    try {
      await api.put(`/v1/departamentos/${editId}/`, values);
      await qc.invalidateQueries({ queryKey: ["departamentos"] });
      showToast("Cambios guardados", "success");
      closeEditModal();
    } catch (e: any) {
      const msg = e?.response?.data
        ? JSON.stringify(e.response.data, null, 2)
        : String(e?.message || e);
      setSaveEditError(msg);
      showToast("Error al guardar", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  // ===== Eliminar
  const handleDelete = async (id: number | string) => {
    if (!confirm("¿Eliminar este departamento?")) return;
    try {
      await api.delete(`/v1/departamentos/${id}/`);
      await qc.invalidateQueries({ queryKey: ["departamentos"] });
      showToast("Departamento eliminado", "success");
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  // ===== Export
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await downloadDepartamentosXlsx({ q: search });
      showToast("Excel exportado", "success");
    } catch (e: any) {
      const msg = String(e?.message || e);
      showToast(`Error al exportar Excel: ${msg}`, "error");
    } finally {
      setExporting(false);
    }
  };

  // Responsive modal
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" fontWeight={700}>
            Departamentos
          </Typography>
          <DepartamentosToolbar
            search={search}
            onSearchChange={setSearch}
            onExportXlsx={handleExportExcel}
            onNew={openCreateModal}
            exporting={exporting}
          />
        </Stack>
      </Paper>

      <DepartamentosTable
        search={search}
        pageSize={25}
        onEdit={(id: number | string) => nav(`/departamentos/${id}/editar`)}
        onDelete={(id: number | string) => handleDelete(id)}
      />

      {/* Crear */}
      <Dialog
        open={openCreate}
        onClose={closeCreateModal}
        fullWidth
        maxWidth="md"
        fullScreen={fullScreen}
      >
        <DialogTitle>Nuevo departamento</DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1, sm: 2 } }}>
          <DepartamentoForm
            onSubmit={handleCreate}
            loading={savingCreate}
            error={createError}
            submitLabel="Crear"
            wrapInPaper={false}
          />
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Close />} onClick={closeCreateModal}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Editar */}
      <Dialog
        open={openEdit}
        onClose={closeEditModal}
        fullWidth
        maxWidth="md"
        fullScreen={fullScreen}
      >
        <DialogTitle>
          {editLoading
            ? "Cargando"
            : editData
            ? `Editar: ${editData?.nombre ?? ""}`
            : "Editar departamento"}
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1, sm: 2 }, minHeight: 140 }}>
          {!editLoading && editData && (
            <DepartamentoForm
              defaultValues={editData}
              onSubmit={handleUpdate}
              loading={savingEdit}
              error={saveEditError}
              submitLabel="Guardar cambios"
              wrapInPaper={false}
            />
          )}
          {!editLoading && !editData && saveEditError && (
            <Box color="error.main">{saveEditError}</Box>
          )}
          {editLoading && (
            <Box sx={{ display: "grid", placeItems: "center", height: 140 }}>
              Cargando…
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Close />} onClick={closeEditModal}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
