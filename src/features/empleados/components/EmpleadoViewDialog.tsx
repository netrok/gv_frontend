import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography, Chip, Box } from "@mui/material";
import { Close, Edit as EditIcon } from "@mui/icons-material";
import api from "../../../lib/api";
import { toTitle, fmtDate } from "../helpers/format";

type Props = {
  open: boolean;
  empleadoId: number | string | null;
  onClose: () => void;
  onEdit?: (id: number | string) => void;
  puestoMap: Record<string, string>;
  dptoMap: Record<string, string>;
};

export default function EmpleadoViewDialog({
  open, empleadoId, onClose, onEdit, puestoMap, dptoMap,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    if (!open || empleadoId == null) return;
    setLoading(true); setError(null); setData(null);
    (async () => {
      try {
        const { data } = await api.get(`/v1/empleados/${empleadoId}/`, { params: { expand: "puesto,departamento" } });
        if (active) setData(data);
      } catch (e: any) {
        if (active) setError(String(e?.message ?? e));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [open, empleadoId]);

  const puestoLabel = data?.puesto?.nombre ?? puestoMap[String(data?.puesto_id ?? data?.puesto)] ?? "—";
  const dptoLabel   = data?.departamento?.nombre ?? dptoMap[String(data?.departamento_id ?? data?.departamento)] ?? "—";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {loading ? "Cargando…" : data ? `Empleado: ${toTitle(data.nombres ?? "")} ${toTitle(data.apellido_paterno ?? "")}` : "Empleado"}
      </DialogTitle>
      <DialogContent dividers sx={{ p: { xs: 1, sm: 2 } }}>
        {loading && <Box sx={{ display: "grid", placeItems: "center", height: 160 }}>Cargando…</Box>}
        {!loading && error && <Typography color="error">{error}</Typography>}
        {!loading && data && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">No. Empleado</Typography>
              <Typography variant="body1">{data.num_empleado ?? "—"}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Activo</Typography>
              <Chip
                label={(data.activo ? "Activo" : "Inactivo")}
                color={data.activo ? "success" : "default"}
                size="small"
                variant={data.activo ? "filled" : "outlined"}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Nombres</Typography>
              <Typography variant="body1">{toTitle(data.nombres ?? data.nombre ?? "")}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Apellidos</Typography>
              <Typography variant="body1">{toTitle(`${data.apellido_paterno ?? ""} ${data.apellido_materno ?? ""}`.trim())}</Typography>
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
              <Typography variant="body1">{fmtDate(data.fecha_ingreso ?? data.ingreso)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{data.email ?? "—"}</Typography>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        {data && onEdit && (
          <Button
            startIcon={<EditIcon />}
            onClick={() => { onClose(); onEdit(data.id); }}
          >
            Editar
          </Button>
        )}
        <Button startIcon={<Close />} onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
