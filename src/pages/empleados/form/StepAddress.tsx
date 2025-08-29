// src/pages/empleados/form/StepAddress.tsx
import { Paper, Grid, TextField } from "@mui/material";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { EmpleadoFormInputs } from "@/features/empleados/utils/schema";

type Props = {
  register: UseFormRegister<EmpleadoFormInputs>;
  errors?: FieldErrors<EmpleadoFormInputs>;
};

const onlyDigits = (s: string) => s.replace(/\D+/g, "");

export default function StepAddress({ register, errors }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Calle" {...register("calle")} />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField fullWidth label="Número" {...register("numero")} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Colonia" {...register("colonia")} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Municipio" {...register("municipio")} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Estado" {...register("estado")} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="CP"
            {...register("cp", {
              setValueAs: (v) =>
                v == null || v === "" ? v : onlyDigits(String(v)).slice(0, 5),
            })}
            inputProps={{ maxLength: 5 }}
            error={!!errors?.cp}
            helperText={errors?.cp?.message as any}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
