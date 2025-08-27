import * as React from "react";
import { Stack, TextField, Button, Tooltip } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
  onNew: () => void;
};

export default function EmpleadosToolbar({
  search, onSearchChange, onExportCsv, onExportPdf, onNew,
}: Props) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <TextField
        size="small"
        placeholder="Buscar"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Tooltip title="Exportar CSV">
        <Button startIcon={<FileDownloadIcon />} variant="outlined" onClick={onExportCsv}>
          CSV
        </Button>
      </Tooltip>
      <Tooltip title="Exportar PDF con marca de agua">
        <Button startIcon={<PictureAsPdfIcon />} variant="outlined" onClick={onExportPdf}>
          PDF
        </Button>
      </Tooltip>
      <Button variant="contained" onClick={onNew}>Nuevo</Button>
    </Stack>
  );
}
