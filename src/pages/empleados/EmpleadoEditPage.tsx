// src/pages/empleados/EmpleadoEditPage.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import EmpleadoForm from "./EmpleadoForm";
import type { EmpleadoFormValues } from "./form/schema";
import api from "../../lib/api";
import type { Empleado } from "../../types";

export default function EmpleadoEditPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [empleado, setEmpleado] = React.useState<Empleado | null>(null);

  // Campos permitidos por OPTIONS (evita enviar llaves que el backend no acepta)
  const allowedFieldsRef = React.useRef<Set<string> | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [{ data: emp }, meta] = await Promise.all([
          api.get(`/v1/empleados/${id}/`),
          api.options("/v1/empleados/"),
        ]);

        if (!active) return;

        setEmpleado(emp);

        const actions = meta?.data?.actions ?? {};
        const fieldsObj =
          actions.PUT ?? actions.PATCH ?? actions.POST ?? {};
        const fields = Object.keys(fieldsObj);
        allowedFieldsRef.current = new Set(
          fields.length ? fields : Object.keys(emp ?? {})
        );
      } catch (e: any) {
        if (active) setError(String(e?.message ?? e));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // Normaliza el empleado cargado a los valores que espera el formulario
  const defaultValues: Partial<EmpleadoFormValues> | undefined =
    React.useMemo(() => {
      if (!empleado) return undefined;
      const dep = (empleado as any)?.departamento;
      const pst = (empleado as any)?.puesto;
      return {
        ...(empleado as any),
        // Normalizar selects a IDs numéricos
        departamento:
          typeof dep === "number" ? dep : dep?.id ?? undefined,
        puesto:
          typeof pst === "number" ? pst : pst?.id ?? undefined,
        // Defaults seguros para el form
        fecha_ingreso: (empleado as any)?.fecha_ingreso ?? "",
        activo: (empleado as any)?.activo ?? true,
      };
    }, [empleado]);

  // Filtra payload según OPTIONS
  function filterPayload(values: EmpleadoFormValues) {
    const set = allowedFieldsRef.current;
    // por si los selects vienen como strings, casteamos a number
    const base: any = {
      ...values,
      departamento:
        values.departamento != null ? Number(values.departamento) : values.departamento,
      puesto:
        values.puesto != null ? Number(values.puesto) : values.puesto,
    };

    if (!set) return base;

    const out: Record<string, any> = {};
    for (const k of Object.keys(base)) {
      const v = base[k];
      if (set.has(k) && v !== "" && v !== undefined) out[k] = v;
    }
    return out;
  }

  const handleSubmit = async (values: EmpleadoFormValues) => {
    setSaving(true);
    setError(null);
    try {
      const payload = filterPayload(values);
      await api.put(`/v1/empleados/${id}/`, payload);
      nav("/empleados");
    } catch (e: any) {
      const msg = e?.response?.data
        ? JSON.stringify(e.response.data, null, 2)
        : String(e?.message || e);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!empleado) {
    return <Box sx={{ p: 2 }}>No se encontró el empleado.</Box>;
  }

  return (
    <EmpleadoForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      loading={saving}
      error={error}
      submitLabel="Guardar"
    />
  );
}
