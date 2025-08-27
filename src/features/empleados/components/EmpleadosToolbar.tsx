// src/features/empleados/components/EmpleadosToolbar.tsx
import * as React from "react";
import { Stack, TextField, Button, Tooltip } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onExportXlsx: () => void | Promise<void>;
  onExportPdf?: () => void | Promise<void>;
  onNew?: () => void;
  /** Si la pasas, controla el estado de loading del botón Excel desde afuera */
  exporting?: boolean;
};

export default function EmpleadosToolbar({
  search,
  onSearchChange,
  onExportXlsx,
  onExportPdf,
  onNew,
  exporting,
}: Props) {
  // Si no nos pasan "exporting", manejamos un busy local
  const [busyLocal, setBusyLocal] = React.useState(false);
  const busy = exporting ?? busyLocal;

  const handleExportXlsx = async () => {
    if (exporting !== undefined) {
      // controlado desde el padre
      await onExportXlsx();
      return;
    }
    try {
      setBusyLocal(true);
      await onExportXlsx();
    } finally {
      setBusyLocal(false);
    }
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems="center"
      sx={{ width: "100%" }}
    >
      <TextField
        size="small"
        placeholder="Buscar"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1, minWidth: 220 }}
      />

      <Tooltip title="Exportar Excel">
        {/* envolver Button en un <span> para que Tooltip funcione cuando está disabled */}
        <span>
          <Button
            startIcon={<FileDownloadIcon />}
            variant="outlined"
            onClick={handleExportXlsx}
            disabled={busy}
          >
            {busy ? "Exportando…" : "Excel"}
          </Button>
        </span>
      </Tooltip>

      {onExportPdf && (
        <Tooltip title="Exportar PDF con marca de agua">
          <span>
            <Button
              startIcon={<PictureAsPdfIcon />}
              variant="outlined"
              onClick={() => onExportPdf?.()}
              disabled={busy}
            >
              PDF
            </Button>
          </span>
        </Tooltip>
      )}

      {onNew && (
        <Button variant="contained" onClick={onNew}>
          Nuevo
        </Button>
      )}
    </Stack>
  );
}
