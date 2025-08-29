// src/pages/empleados/form/StepAltaExpress.tsx
import * as React from "react";
import {
  Grid, TextField, MenuItem, Switch, FormControlLabel, Avatar, Stack, Button,
} from "@mui/material";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import type { EmpleadoFormInputs } from "@/features/empleados/utils/schema";

type Cat = { id: number; nombre: string };

type Props = {
  control: Control<EmpleadoFormInputs>;
  register: UseFormRegister<EmpleadoFormInputs>;
  setValue: UseFormSetValue<EmpleadoFormInputs>;
  errors?: FieldErrors<EmpleadoFormInputs>;
  activo: boolean;
  departamentos?: Cat[];
  puestos?: Cat[];
  fotoUrl?: string;
};

export default function StepAltaExpress({
  control, register, setValue, errors, activo,
  departamentos = [], puestos = [], fotoUrl,
}: Props) {
  const [preview, setPreview] = React.useState<string | undefined>(fotoUrl);

  React.useEffect(() => { setPreview(fotoUrl); }, [fotoUrl]);

  return (
    <Grid container spacing={2}>
      {/* Básicos */}
      <Grid item xs={12} md={4}>
        <TextField
          label="No. empleado"
          fullWidth
          {...register("num_empleado")}
          error={!!errors?.num_empleado}
          helperText={errors?.num_empleado?.message as any}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="Nombres"
          fullWidth
          {...register("nombres")}
          error={!!errors?.nombres}
          helperText={errors?.nombres?.message as any}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="Apellido paterno"
          fullWidth
          {...register("apellido_paterno")}
          error={!!errors?.apellido_paterno}
          helperText={errors?.apellido_paterno?.message as any}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="Apellido materno"
          fullWidth
          {...register("apellido_materno")}
          error={!!errors?.apellido_materno}
          helperText={errors?.apellido_materno?.message as any}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          select
          label="Departamento"
          fullWidth
          defaultValue=""
          {...register("departamento_id")}
          error={!!errors?.departamento_id}
          helperText={errors?.departamento_id?.message as any}
        >
          <MenuItem value=""><em>—</em></MenuItem>
          {departamentos.map((d) => (
            <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          select
          label="Puesto"
          fullWidth
          defaultValue=""
          {...register("puesto_id")}
          error={!!errors?.puesto_id}
          helperText={errors?.puesto_id?.message as any}
        >
          <MenuItem value=""><em>—</em></MenuItem>
          {puestos.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="Fecha de ingreso"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          {...register("fecha_ingreso")}
          error={!!errors?.fecha_ingreso}
          helperText={errors?.fecha_ingreso?.message as any}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          {...register("email")}
          error={!!errors?.email}
          helperText={errors?.email?.message as any}
        />
      </Grid>

      <Grid item xs={12} md={4} sx={{ display: "flex", alignItems: "center" }}>
        <Controller
          name="activo"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              label="Activo"
              control={
                <Switch
                  checked={Boolean(field.value ?? activo)}  // sin warning de ?? inalcanzable
                  onChange={(_, checked) => field.onChange(checked)}
                  inputRef={field.ref}
                />
              }
            />
          )}
        />
      </Grid>

      {/* Foto */}
      <Grid item xs={12}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={preview} sx={{ width: 64, height: 64 }} />
          <Controller
            control={control}
            name="foto"
            render={({ field }) => (
              <Button variant="outlined" component="label">
                Subir foto
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    field.onChange(f ?? undefined);
                    setPreview(f ? URL.createObjectURL(f) : undefined);
                  }}
                />
              </Button>
            )}
          />
          {preview && (
            <Button
              variant="text"
              onClick={() => {
                setPreview(undefined);
                setValue("foto", undefined as any);
              }}
            >
              Quitar
            </Button>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
}
