import React from "react";
import { useNavigate } from "react-router-dom";
import EmpleadoForm from "./EmpleadoForm";
import type { EmpleadoFormValues } from "./EmpleadoForm";
import api from "../../lib/api";

export default function EmpleadoCreatePage(){
  const nav = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (values: EmpleadoFormValues) => {
    setLoading(true); setError(null);
    try{
      const payload = { ...values, departamento: values.departamento, puesto: values.puesto };
      await api.post("/v1/empleados/", payload);
      nav("/empleados");
    }catch(e:any){
      const msg = e?.response?.data ? JSON.stringify(e.response.data, null, 2) : String(e?.message || e);
      setError(msg);
    }finally{
      setLoading(false);
    }
  };

  return <EmpleadoForm onSubmit={handleSubmit} loading={loading} error={error} submitLabel="Crear" />;
}
