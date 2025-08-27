// src/pages/empleados/EmpleadosExportBar.tsx
import React from "react";
import { Button, Stack, Alert } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import TableViewIcon from "@mui/icons-material/TableView";

// ✅ Usa la ruta relativa (sin alias) para evitar "Cannot find module './export/excel'"
import { downloadEmpleadosXlsx } from "../../features/empleados/export/excel";
// Si usas alias "@", podrías usar:
// import { downloadEmpleadosXlsx } from "@/features/empleados/export/excel";

type Filters = {
  q?: string;
  departamento_id?: number;
  puesto_id?: number;
  activo?: boolean;
};

type Props = {
  // Snapshot de filtros; pásalo desde el padre (ej. con RHF: watch())
  values: Filters;
  // Estados/handlers existentes en tu barra:
  loading?: boolean;
  onVerPdf: () => void;
  onDescargarPdf: () => void;
};

export default function EmpleadosExportBar({
  values,
  loading,
  onVerPdf,
  onDescargarPdf,
}: Props) {
  const [downloadingXlsx, setDownloadingXlsx] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function onExcel() {
    try {
      setDownloadingXlsx(true);
      setErrorMsg(null);
      await downloadEmpleadosXlsx({
        q: values.q || undefined,
        departamento_id: values.departamento_id || undefined,
        puesto_id: values.puesto_id || undefined,
        activo:
          typeof values.activo === "boolean" ? values.activo : undefined,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "No fue posible generar el Excel");
    } finally {
      setDownloadingXlsx(false);
    }
  }

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          onClick={onVerPdf}
          disabled={!!loading}
        >
          Ver PDF
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onDescargarPdf}
          disabled={!!loading}
        >
          Descargar PDF
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<TableViewIcon />}
          onClick={onExcel}
          disabled={downloadingXlsx}
        >
          Excel
        </Button>
      </Stack>

      {errorMsg && (
        <Alert sx={{ mt: 1 }} severity="error">
          {errorMsg}
        </Alert>
      )}
    </>
  );
}
