import { Stack, TextField, Button, Tooltip } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  onExportXlsx: () => Promise<void> | void;
  onNew?: () => void;
  exporting?: boolean;
};

export default function DepartamentosToolbar({
  search,
  onSearchChange,
  onExportXlsx,
  onNew,
  exporting = false,
}: Props) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      alignItems="center"
      justifyContent="space-between"
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
        <span>
          <Button
            startIcon={<FileDownloadIcon />}
            variant="outlined"
            onClick={onExportXlsx}
            disabled={exporting}
          >
            {exporting ? "Exportando…" : "Excel"}
          </Button>
        </span>
      </Tooltip>

      {onNew && (
        <Button variant="contained" onClick={onNew}>
          Nuevo
        </Button>
      )}
    </Stack>
  );
}
