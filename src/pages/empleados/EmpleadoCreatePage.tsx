// src/pages/empleados/EmpleadoCreatePage.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api";
import EmpleadoForm from "./EmpleadoForm";
import { toFormData } from "@/features/empleados/utils/toFormData";
import type { EmpleadoFormValues } from "@/features/empleados/utils/schema";

export default function EmpleadoCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(values: EmpleadoFormValues) {
    setLoading(true);
    setError(null);
    try {
      const fd = toFormData(values as any);
      await api.post("/v1/empleados/", fd); // Axios pone el boundary automáticamente
      try { localStorage.removeItem("empleado:create"); } catch {}
      navigate("/empleados");
    } catch (e: any) {
      const msg = e?.response?.data
        ? JSON.stringify(e.response.data, null, 2)
        : String(e?.message || e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <EmpleadoForm
      submitLabel="Crear"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
}
