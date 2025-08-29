// src/pages/empleados/form/StepBank.tsx
import { Paper, Grid, TextField } from "@mui/material";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { EmpleadoFormInputs } from "@/features/empleados/utils/schema";

type Props = {
  register: UseFormRegister<EmpleadoFormInputs>;
  errors?: FieldErrors<EmpleadoFormInputs>;
};

const onlyDigits = (v: unknown) => String(v ?? "").replace(/\D+/g, "");

export default function StepBank({ register, errors }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Banco" {...register("banco")} />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="CLABE"
            inputProps={{ maxLength: 18, inputMode: "numeric", pattern: "\\d*" }}
            {...register("clabe", {
              setValueAs: (v) => {
                const s = onlyDigits(v).slice(0, 18);
                return s === "" ? null : s; // tu schema acepta null/optional
              },
            })}
            error={!!errors?.clabe}
            helperText={errors?.clabe?.message as any}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Cuenta"
            inputProps={{ maxLength: 20, inputMode: "numeric", pattern: "\\d*" }}
            {...register("cuenta", {
              setValueAs: (v) => {
                const s = onlyDigits(v).slice(0, 20); // backend valida 10–20; aquí solo capamos a 20
                return s === "" ? null : s;
              },
            })}
            error={!!errors?.cuenta}
            helperText={errors?.cuenta?.message as any}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
