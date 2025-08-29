// src/pages/empleados/form/StepLabor.tsx
import { Grid, TextField, MenuItem } from "@mui/material";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { EmpleadoFormInputs } from "@/features/empleados/utils/schema";

type Props = {
  register: UseFormRegister<EmpleadoFormInputs>;
  errors?: FieldErrors<EmpleadoFormInputs>;
  turnos?: Array<{ id: number; nombre: string }>;
  horarios?: Array<{ id: number; nombre: string }>;
};

export default function StepLabor({
  register,
  errors,
  turnos = [],
  horarios = [],
}: Props) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <TextField
          label="Sueldo (MXN)"
          fullWidth
          type="number"
          inputProps={{ step: "0.01" }}
          {...register("sueldo")}
          error={!!errors?.sueldo}
          helperText={errors?.sueldo?.message as any}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          select
          label="Tipo de contrato"
          fullWidth
          defaultValue=""
          {...register("tipo_contrato")}
          error={!!errors?.tipo_contrato}
          helperText={errors?.tipo_contrato?.message as any}
        >
          <MenuItem value=""><em>—</em></MenuItem>
          <MenuItem value="determinado">Determinado</MenuItem>
          <MenuItem value="indeterminado">Indeterminado</MenuItem>
          <MenuItem value="obra">Obra o proyecto</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          select
          label="Tipo de jornada"
          fullWidth
          defaultValue=""
          {...register("tipo_jornada")}
          error={!!errors?.tipo_jornada}
          helperText={errors?.tipo_jornada?.message as any}
        >
          <MenuItem value=""><em>—</em></MenuItem>
          <MenuItem value="diurna">Diurna</MenuItem>
          <MenuItem value="mixta">Mixta</MenuItem>
          <MenuItem value="nocturna">Nocturna</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          select
          label="Turno"
          fullWidth
          defaultValue=""
          {...register("turno_id")}
          error={!!errors?.turno_id}
          helperText={errors?.turno_id?.message as any}
        >
          <MenuItem value=""><em>—</em></MenuItem>
          {turnos.map((t) => (
            <MenuItem key={t.id} value={t.id}>{t.nombre}</MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          select
          label="Horario"
          fullWidth
          defaultValue=""
          {...register("horario_id")}
          error={!!errors?.horario_id}
          helperText={errors?.horario_id?.message as any}
        >
          <MenuItem value=""><em>—</em></MenuItem>
          {horarios.map((h) => (
            <MenuItem key={h.id} value={h.id}>{h.nombre}</MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  );
}
