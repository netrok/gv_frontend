// src/pages/puestos/PuestoForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert, Button, FormControlLabel, MenuItem, Paper, Stack, Switch, TextField
} from "@mui/material";
import Grid from "@mui/material/Grid"; // v6 estable
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";

// ---- esquema, tipos y helpers iguales a los que ya tienes ----
const puestoSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre mínimo 2 caracteres"),
  clave: z.string().trim().min(1, "Clave requerida"),
  descripcion: z.string().trim().optional().or(z.literal("")).transform(v => v === "" ? undefined : v),
  activo: z.coerce.boolean().default(true),
  departamento: z.preprocess((v) => {
    if (v === "" || v == null) return undefined;
    if (typeof v === "string") { const n = Number(v); return Number.isNaN(n) ? undefined : n; }
    return v;
  }, z.number().int().positive().optional()).optional(),
});
export type PuestoFormValues = z.input<typeof puestoSchema>;

type Departamento = { id:number; nombre:string };
const normalize = <T,>(d:any):T[] => Array.isArray(d) ? d : (d?.results ?? []);
const fetchDepartamentos = async () => normalize<Departamento>((await api.get("/v1/departamentos/")).data);

interface Props {
  defaultValues?: Partial<PuestoFormValues>;
  onSubmit: (v: PuestoFormValues) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
  requiredDepartamento?: boolean;
  wrapInPaper?: boolean;
}

const PuestoForm: React.FC<Props> = ({
  defaultValues, onSubmit, loading, error,
  submitLabel = "Guardar", requiredDepartamento = false, wrapInPaper = true
}) => {
  const { data: departamentos = [], isLoading: loadingDeps } = useQuery({ queryKey:["departamentos"], queryFn: fetchDepartamentos });

  const { register, handleSubmit, formState:{ errors }, watch, setValue } = useForm<PuestoFormValues>({
    resolver: zodResolver(puestoSchema),
    defaultValues: { activo: true, ...defaultValues },
    mode: "onBlur",
  });

  const form = (
    <Stack spacing={2}>
      {error && <Alert severity="error" sx={{ whiteSpace:"pre-wrap", fontFamily:"monospace" }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField label="Nombre" fullWidth required
            {...register("nombre")}
            error={!!errors.nombre} helperText={errors.nombre?.message}/>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField label="Clave" fullWidth required
            {...register("clave")}
            error={!!errors.clave} helperText={errors.clave?.message}/>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField select fullWidth
            label={`Departamento${requiredDepartamento ? " *" : ""}`}
            defaultValue={defaultValues?.departamento ?? ""}
            {...register("departamento")}
            error={!!errors.departamento} helperText={errors.departamento?.message as any}>
            <MenuItem value="">— Sin asignar —</MenuItem>
            {!loadingDeps && departamentos.map(d => (
              <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch checked={!!watch("activo")}
                onChange={(_, checked) => setValue("activo", checked as any, { shouldDirty:true })}/>
            }
            label="Activo"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField label="Descripción" fullWidth multiline minRows={3}
            {...register("descripcion")}
            error={!!errors.descripcion} helperText={errors.descripcion?.message}/>
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Button type="submit" variant="contained" disabled={loading}>{submitLabel}</Button>
      </Stack>
    </Stack>
  );

  return wrapInPaper
    ? <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p:2 }}>{form}</Paper>
    : <form onSubmit={handleSubmit(onSubmit)}>{form}</form>;
};

export default PuestoForm;
