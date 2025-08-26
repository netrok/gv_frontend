import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Grid, Paper, Stack, Switch, TextField, Typography } from "@mui/material";

const schema = z.object({
  nombre: z.string().min(1, "Requerido"),
  clave: z.string().optional(),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true),
});
export type DepartamentoFormValues = z.infer<typeof schema>;

export default function DepartamentoForm({
  defaultValues,
  onSubmit,
  loading,
  error,
  submitLabel = "Guardar",
  wrapInPaper = false,
}: {
  defaultValues?: Partial<DepartamentoFormValues>;
  onSubmit: (v: DepartamentoFormValues) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
  wrapInPaper?: boolean;
}) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<DepartamentoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", activo: true, ...defaultValues },
  });

  const activo = watch("activo");

  const content = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={800}>Departamento</Typography>
        {error && <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Nombre" {...register("nombre")} error={!!errors.nombre} helperText={errors.nombre?.message}/>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Clave" {...register("clave")} />
          </Grid>
          <Grid item xs={12} md={9}>
            <TextField fullWidth label="Descripción" {...register("descripcion")} />
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
              <Switch checked={!!activo} onChange={(e)=> (e.target as HTMLInputElement).checked} {...register("activo")} />
              <Typography>{activo ? "Activo" : "Inactivo"}</Typography>
            </Stack>
          </Grid>
        </Grid>
        <Stack direction="row" justifyContent="flex-end">
          <Button type="submit" variant="contained" disabled={loading}>{loading ? "Guardando..." : submitLabel}</Button>
        </Stack>
      </Stack>
    </form>
  );

  if (wrapInPaper) return <Paper sx={{ p: 2 }}>{content}</Paper>;
  return content;
}


