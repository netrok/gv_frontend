import { Paper, Grid, TextField } from "@mui/material";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { EmpleadoFormInputs } from "@/features/empleados/utils/schema";

type Props = {
  register: UseFormRegister<EmpleadoFormInputs>;
  errors?: FieldErrors<EmpleadoFormInputs>;
};

const onlyDigits = (v: unknown) => String(v ?? "").replace(/\D+/g, "");

export default function StepEmergency({ register, errors }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Contacto de emergencia"
            {...register("contacto_emergencia_nombre")}
            error={!!errors?.contacto_emergencia_nombre}
            helperText={errors?.contacto_emergencia_nombre?.message as any}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Parentesco"
            {...register("contacto_emergencia_parentesco")}
            error={!!errors?.contacto_emergencia_parentesco}
            helperText={errors?.contacto_emergencia_parentesco?.message as any}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Teléfono de emergencia"
            inputProps={{ maxLength: 10, inputMode: "numeric", pattern: "\\d*" }}
            {...register("contacto_emergencia_telefono", {
              setValueAs: (v) => {
                const s = onlyDigits(v).slice(0, 10);
                return s === "" ? null : s;
              },
            })}
            error={!!errors?.contacto_emergencia_telefono}
            helperText={errors?.contacto_emergencia_telefono?.message as any}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField fullWidth label="Escolaridad" {...register("escolaridad")} />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Notas"
            multiline
            minRows={2}
            {...register("notas")}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
