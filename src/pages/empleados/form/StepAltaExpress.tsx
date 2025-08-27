// src/pages/empleados/form/StepAltaExpress.tsx
import { Grid, Paper, TextField, Stack, Typography, Switch, InputAdornment } from "@mui/material";
import { Badge, Person, Business, Work, Today, Mail } from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import type { EmpleadoFormInputs } from "./schema";

type Catalogo = { id: number; nombre: string };

type Props = {
  register: UseFormRegister<EmpleadoFormInputs>;
  control: Control<EmpleadoFormInputs>;
  errors: FieldErrors<EmpleadoFormInputs>;
  setValue: UseFormSetValue<EmpleadoFormInputs>;
  activo: boolean; // viene ya normalizado desde el padre (Boolean(watch('activo')))
  departamentos: Catalogo[];
  puestos: Catalogo[];
};

export default function StepAltaExpress({
  register,
  control,
  errors,
  setValue,
  activo,
  departamentos,
  puestos,
}: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="No. empleado"
            placeholder="Ej. 00127"
            {...register("num_empleado")}
            error={!!errors.num_empleado}
            helperText={errors.num_empleado?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Badge fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Nombres"
            placeholder="Nombre(s)"
            {...register("nombres")}
            error={!!errors.nombres}
            helperText={errors.nombres?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Apellido paterno"
            placeholder="Paterno"
            {...register("apellido_paterno")}
            error={!!errors.apellido_paterno}
            helperText={errors.apellido_paterno?.message}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Apellido materno"
            placeholder="Materno"
            {...register("apellido_materno")}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            control={control}
            name="departamento"
            render={({ field }) => {
              const value = departamentos.find((d) => d.id === Number(field.value)) ?? null;
              return (
                <Autocomplete
                  options={departamentos}
                  value={value}
                  onChange={(_, v) => field.onChange(v?.id ?? undefined)}
                  getOptionLabel={(o) => o?.nombre ?? ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Departamento"
                      error={!!errors.departamento}
                      helperText={errors.departamento?.message}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              );
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            control={control}
            name="puesto"
            render={({ field }) => {
              const value = puestos.find((p) => p.id === Number(field.value)) ?? null;
              return (
                <Autocomplete
                  options={puestos}
                  value={value}
                  onChange={(_, v) => field.onChange(v?.id ?? undefined)}
                  getOptionLabel={(o) => o?.nombre ?? ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Puesto"
                      error={!!errors.puesto}
                      helperText={errors.puesto?.message}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Work fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              );
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Fecha de ingreso"
            type="date"
            InputLabelProps={{ shrink: true }}
            {...register("fecha_ingreso")}
            error={!!errors.fecha_ingreso}
            helperText={errors.fecha_ingreso?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Today fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Email corporativo"
            placeholder="nombre@tuempresa.com"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Estado:
              </Typography>
              <Switch
                checked={!!activo}
                onChange={(e) => setValue("activo", e.target.checked)}
              />
              <Typography variant="body2" fontWeight={600}>
                {activo ? "Activo" : "Inactivo"}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              Completa lo esencial y continúa con los detalles.
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
