import { Paper, Grid, TextField } from "@mui/material";
import type { UseFormRegister } from "react-hook-form";
import type { EmpleadoFormInputs } from "./schema";
import { onlyDigits } from "./utils";

export default function StepBank({ register }: { register: UseFormRegister<EmpleadoFormInputs>; }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><TextField fullWidth label="Banco" {...register("banco")} /></Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="CLABE" {...register("clabe")}
            inputProps={{ maxLength: 18 }}
            onChange={(e)=>{ e.target.value = onlyDigits(e.target.value).slice(0,18); }} />
        </Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Cuenta" {...register("cuenta")} /></Grid>
      </Grid>
    </Paper>
  );
}
