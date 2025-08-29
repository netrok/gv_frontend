// src/pages/empleados/form/StepIdPersonal.tsx
import { Paper, Stack, Typography, Grid, TextField, InputAdornment, MenuItem } from "@mui/material";
import { Mail, Phone, PhoneIphone } from "@mui/icons-material";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { EmpleadoFormInputs } from "@/features/empleados/utils/schema";

type Props = {
  register: UseFormRegister<EmpleadoFormInputs>;
  errors?: FieldErrors<EmpleadoFormInputs>;
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
                setValueAs: (v) => (v == null || v === "" ? v : upperAN(String(v)).slice(0, 13)),
              })}
              inputProps={{ maxLength: 13 }}
              error={!!errors?.rfc}
              helperText={errors?.rfc?.message as any}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="CURP"
              {...register("curp", {
                setValueAs: (v) => (v == null || v === "" ? v : upperAN(String(v)).slice(0, 18)),
              })}
              inputProps={{ maxLength: 18 }}
              error={!!errors?.curp}
              helperText={errors?.curp?.message as any}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="NSS"
              {...register("nss", {
                setValueAs: (v) => (v == null || v === "" ? v : onlyDigits(String(v)).slice(0, 11)),
              })}
              inputProps={{ maxLength: 11 }}
              error={!!errors?.nss}
              helperText={errors?.nss?.message as any}
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
              error={!!errors?.fecha_nacimiento}
              helperText={errors?.fecha_nacimiento?.message as any}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Género"
              defaultValue=""
              {...register("genero")}
              error={!!errors?.genero}
              helperText={errors?.genero?.message as any}
            >
              {GENEROS.map((g) => (
                <MenuItem key={g.value} value={g.value}>
                  {g.label}
                </MenuItem>
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
              error={!!errors?.estado_civil}
              helperText={errors?.estado_civil?.message as any}
            >
              {ESTADOS_CIVIL.map((e) => (
                <MenuItem key={e.value} value={e.value}>
                  {e.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Teléfono"
              {...register("telefono", {
                setValueAs: (v) => (v == null || v === "" ? v : onlyDigits(String(v)).slice(0, 10)),
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize="small" />
                  </InputAdornment>
                ),
              }}
              error={!!errors?.telefono}
              helperText={errors?.telefono?.message as any}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Celular"
              {...register("celular", {
                setValueAs: (v) => (v == null || v === "" ? v : onlyDigits(String(v)).slice(0, 10)),
              })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIphone fontSize="small" />
                  </InputAdornment>
                ),
              }}
              error={!!errors?.celular}
              helperText={errors?.celular?.message as any}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register("email")}
              error={!!errors?.email}
              helperText={errors?.email?.message as any}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
}
