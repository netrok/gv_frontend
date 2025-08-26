import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import EmpleadoForm from "./EmpleadoForm";
import type { EmpleadoFormValues } from "./EmpleadoForm";
import api from "../../lib/api";
import type { Empleado } from "../../types";

export default function EmpleadoEditPage(){
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [empleado, setEmpleado] = React.useState<Empleado | null>(null);
  const allowedFieldsRef = React.useRef<Set<string> | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try{
        const [{ data: emp }, meta] = await Promise.all([
          api.get(`/v1/empleados/${id}/`),
          api.options("/v1/empleados/")
        ]);
        if (active) {
          setEmpleado(emp);
          const fields = Object.keys(meta?.data?.actions?.PUT ?? meta?.data?.actions?.PATCH ?? {});
          allowedFieldsRef.current = new Set(fields.length ? fields : Object.keys(meta?.data?.actions?.POST ?? {}));
        }
      }catch(e:any){
        if (active) setError(String(e?.message ?? e));
      }finally{
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  function filterPayload(values: EmpleadoFormValues) {
    const set = allowedFieldsRef.current;
    const base = { ...values, departamento: values.departamento, puesto: values.puesto };
    if (!set) return base;
    const out: any = {};
    for (const k of Object.keys(base)) {
      if (set.has(k) && base[k] !== "" && base[k] !== undefined) out[k] = base[k];
    }
    return out;
  }

  const handleSubmit = async (values: EmpleadoFormValues) => {
    setSaving(true); setError(null);
    try{
      const payload = filterPayload(values);
      await api.put(`/v1/empleados/${id}/`, payload);
      nav("/empleados");
    }catch(e:any){
      const msg = e?.response?.data ? JSON.stringify(e.response.data, null, 2) : String(e?.message || e);
      setError(msg);
    }finally{
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{display:"grid",placeItems:"center",minHeight:"50vh"}}><CircularProgress/></Box>;
  if (!empleado) return <Box sx={{p:2}}>No se encontró el empleado.</Box>;

  return <EmpleadoForm defaultValues={empleado} onSubmit={handleSubmit} loading={saving} error={error} submitLabel="Guardar" />;
}
