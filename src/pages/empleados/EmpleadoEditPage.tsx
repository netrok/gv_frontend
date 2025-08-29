// src/pages/empleados/EmpleadoEditPage.tsx
import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { api } from "@/api";
import EmpleadoForm from "./EmpleadoForm";
import { toFormData } from "@/features/empleados/utils/toFormData";
import type { EmpleadoFormValues } from "@/features/empleados/utils/schema";

export default function EmpleadoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fetching, setFetching] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get(`/v1/empleados/${id}/`);
        if (alive) setData(data);
      } catch (e: any) {
        if (alive) setError(e?.response?.data ? JSON.stringify(e.response.data, null, 2) : String(e));
      } finally {
        if (alive) setFetching(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  async function handleSubmit(values: EmpleadoFormValues) {
    setSaving(true);
    setError(null);
    try {
      const fd = toFormData(values as any);
      await api.patch(`/v1/empleados/${id}/`, fd);
      try { localStorage.removeItem(`empleado:edit:${id}`); } catch {}
      navigate("/empleados");
    } catch (e: any) {
      const msg = e?.response?.data ? JSON.stringify(e.response.data, null, 2) : String(e?.message || e);
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (fetching) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Box sx={{ p: 2 }}>No se encontró el empleado.</Box>;
  }

  return (
    <EmpleadoForm
      defaultValues={data}  // incluye *_id y foto_url; el form ya los maneja
      onSubmit={handleSubmit}
      loading={saving}
      error={error}
      submitLabel="Guardar"
    />
  );
}
