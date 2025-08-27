// src/pages/empleados/form/StepIdPersonal.tsx
import { Paper, Stack, Typography, Grid, TextField, InputAdornment, MenuItem } from "@mui/material";
import { Mail, Phone, PhoneIphone } from "@mui/icons-material";
import { type UseFormRegister, type FieldErrors } from "react-hook-form";
import type { EmpleadoFormInputs } from "./schema";

type Props = {
  register: UseFormRegister<EmpleadoFormInputs>;
  errors: FieldErrors<EmpleadoFormInputs>;
};

const onlyDigits = (s: string) => s.replace(/\D+/g, "");
const upperAN = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

const GENEROS = [
  { value: "", label: "—" },
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "O", label: "Otro" },
];
const ESTADOS_CIVIL = [
  { value: "", label: "—" },
  { value: "soltero", label: "Soltero(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "union_libre", label: "Unión libre" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viudo", label: "Viudo(a)" },
];

export default function StepIdPersonal({ register, errors }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">Identificación</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="RFC"
              {...register("rfc", {
                onChange: (e) => { e.target.value = upperAN(e.target.value).slice(0, 13); },
              })}
              inputProps={{ maxLength: 13 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="CURP"
              {...register("curp", {
                onChange: (e) => { e.target.value = upperAN(e.target.value).slice(0, 18); },
              })}
              inputProps={{ maxLength: 18 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="NSS"
              {...register("nss", {
                onChange: (e) => { e.target.value = onlyDigits(e.target.value).slice(0, 11); },
              })}
              inputProps={{ maxLength: 11 }}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle2">Personales & Contacto</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fecha de nacimiento"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register("fecha_nacimiento")}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Género"
              defaultValue=""
              {...register("genero")}
            >
              {GENEROS.map((g) => (
                <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Estado civil"
              defaultValue=""
              {...register("estado_civil")}
            >
              {ESTADOS_CIVIL.map((e) => (
                <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Teléfono"
              {...register("telefono", {
                onChange: (e) => { e.target.value = onlyDigits(e.target.value).slice(0, 10); },
              })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment> }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Celular"
              {...register("celular", {
                onChange: (e) => { e.target.value = onlyDigits(e.target.value).slice(0, 10); },
              })}
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphone fontSize="small" /></InputAdornment> }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><Mail fontSize="small" /></InputAdornment> }}
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
}
