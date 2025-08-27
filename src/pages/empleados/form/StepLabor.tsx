import { Paper, Grid, TextField } from "@mui/material";
import type { UseFormRegister } from "react-hook-form";
import type { EmpleadoFormInputs } from "./schema";

export default function StepLabor({ register }: { register: UseFormRegister<EmpleadoFormInputs>; }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><TextField fullWidth label="Sueldo (MXN)" {...register("sueldo")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Tipo de contrato" {...register("tipo_contrato")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Tipo de jornada" {...register("tipo_jornada")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Turno" {...register("turno")} /></Grid>
        <Grid item xs={12} md={8}><TextField fullWidth label="Horario" {...register("horario")} /></Grid>
      </Grid>
    </Paper>
  );
}
