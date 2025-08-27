// src/pages/departamentos/DepartamentoForm.tsx
import { z } from "zod";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Grid,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

const schema = z.object({
  nombre: z.string().min(1, "Requerido"),
  clave: z.string().optional(),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true),
});

// 👇 Separamos tipos de Zod:
type DepartamentoInput = z.input<typeof schema>;   // activo puede venir undefined
export type DepartamentoFormValues = z.output<typeof schema>; // activo: boolean

export default function DepartamentoForm({
  defaultValues,
  onSubmit,
  loading,
  error,
  submitLabel = "Guardar",
  wrapInPaper = false,
}: {
  defaultValues?: Partial<DepartamentoFormValues>;
  onSubmit: (v: DepartamentoFormValues) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
  wrapInPaper?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<DepartamentoInput, any, DepartamentoFormValues>({
    resolver: zodResolver(schema),
    // defaultValues es del tipo "input" (el primer genérico):
    defaultValues: { nombre: "", activo: true, ...defaultValues },
  });

  const submit: SubmitHandler<DepartamentoFormValues> = (vals) => onSubmit(vals);

  const content = (
    <form onSubmit={handleSubmit(submit)}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={800}>
          Departamento
        </Typography>

        {error && (
          <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre"
              {...register("nombre")}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Clave" {...register("clave")} />
          </Grid>

          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              label="Descripción"
              {...register("descripcion")}
              multiline
              minRows={2}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Controller
              name="activo"
              control={control}
              render={({ field }) => (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Switch
                    checked={!!field.value}
                    onChange={(_, val) => field.onChange(val)}
                  />
                  <Typography>{field.value ? "Activo" : "Inactivo"}</Typography>
                </Stack>
              )}
            />
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end">
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Guardando..." : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </form>
  );

  return wrapInPaper ? <Paper sx={{ p: 2 }}>{content}</Paper> : content;
}
