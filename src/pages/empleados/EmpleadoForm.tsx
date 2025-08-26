import React from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert, Box, Button, Divider, Grid, MenuItem, Paper, Stack, Switch, TextField, Typography,
  Stepper, Step, StepLabel, LinearProgress, InputAdornment, ToggleButtonGroup, ToggleButton
} from "@mui/material";
import {
  Person, AssignmentInd, ContactPhone, Home, Work, AccountBalance, LocalHospital, DoneAll,
  Badge, Business, Today, Mail, Phone, PhoneIphone
} from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import type { Departamento, Puesto, Empleado } from "../../types";

const GENEROS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "O", label: "Otro" },
];
const ESTADOS_CIVIL = [
  { value: "soltero", label: "Soltero(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "union_libre", label: "Unión libre" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "viudo", label: "Viudo(a)" },
];

// ======= Esquema global
const schema = z.object({
  // Básicos
  num_empleado: z.string().min(1, "Requerido"),
  nombres: z.string().min(1, "Requerido"),
  apellido_paterno: z.string().min(1, "Requerido"),
  apellido_materno: z.string().optional(),
  departamento: z.coerce.number().int("Inválido"),
  puesto: z.coerce.number().int("Inválido"),
  fecha_ingreso: z.string().optional(),
  activo: z.boolean().default(true),

  // Identificación / Personales / Contacto
  rfc: z.string().optional(),
  curp: z.string().optional(),
  nss: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  genero: z.string().optional(),
  estado_civil: z.string().optional(),
  telefono: z.string().optional(),
  celular: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),

  // Domicilio
  calle: z.string().optional(),
  numero: z.string().optional(),
  colonia: z.string().optional(),
  municipio: z.string().optional(),
  estado: z.string().optional(),
  cp: z.string().optional(),

  // Laborales
  sueldo: z.union([z.coerce.number(), z.string()]).optional(),
  tipo_contrato: z.string().optional(),
  tipo_jornada: z.string().optional(),
  turno: z.string().optional(),
  horario: z.string().optional(),

  // Bancarios
  banco: z.string().optional(),
  clabe: z.string().optional(),
  cuenta: z.string().optional(),

  // Emergencia / Otros
  contacto_emergencia_nombre: z.string().optional(),
  contacto_emergencia_telefono: z.string().optional(),
  escolaridad: z.string().optional(),
  comentarios: z.string().optional(),
});
export type EmpleadoFormValues = z.infer<typeof schema>;

// ======= Helpers / data
function normalize<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  return [];
}
const useCatalogo = (path: string) =>
  useQuery({
    queryKey: ["catalogo", path],
    queryFn: async () => {
      const { data } = await api.get(path);
      return normalize<any>(data) as { id: number; nombre: string }[];
    },
    staleTime: 5 * 60 * 1000,
  });

const STEP_FIELDS: string[][] = [
  ["num_empleado","nombres","apellido_paterno","apellido_materno","departamento","puesto","fecha_ingreso","activo","email"],
  ["rfc","curp","nss","fecha_nacimiento","genero","estado_civil","telefono","celular","email"],
  ["calle","numero","colonia","municipio","estado","cp"],
  ["sueldo","tipo_contrato","tipo_jornada","turno","horario"],
  ["banco","clabe","cuenta"],
  ["contacto_emergencia_nombre","contacto_emergencia_telefono","escolaridad","comentarios"],
  [],
];
const STEPS_META = [
  { label: "Alta express", icon: <Person fontSize="small" /> },
  { label: "ID / Personales", icon: <AssignmentInd fontSize="small" /> },
  { label: "Domicilio", icon: <Home fontSize="small" /> },
  { label: "Laboral", icon: <Work fontSize="small" /> },
  { label: "Bancario", icon: <AccountBalance fontSize="small" /> },
  { label: "Emergencia & Otros", icon: <LocalHospital fontSize="small" /> },
  { label: "Revisión", icon: <DoneAll fontSize="small" /> },
];

export default function EmpleadoForm({
  defaultValues,
  onSubmit,
  loading = false,
  error,
  submitLabel = "Guardar",
  wrapInPaper = true,
}: {
  defaultValues?: Partial<Empleado>;
  onSubmit: (values: EmpleadoFormValues) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
  wrapInPaper?: boolean;
}) {
  const { data: departamentos = [] } = useCatalogo("/v1/departamentos/");
  const { data: puestos = [] } = useCatalogo("/v1/puestos/");

  const {
    register, handleSubmit, formState: { errors }, watch, setValue, trigger, getValues, setFocus, control
  } = useForm<EmpleadoFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    defaultValues: {
      // Básicos
      num_empleado: defaultValues?.num_empleado ?? "",
      nombres: defaultValues?.nombres ?? "",
      apellido_paterno: defaultValues?.apellido_paterno ?? "",
      apellido_materno: defaultValues?.apellido_materno ?? "",
      departamento:
        typeof defaultValues?.departamento === "number"
          ? (defaultValues?.departamento as number)
          : (defaultValues?.departamento as any)?.id ?? undefined,
      puesto:
        typeof defaultValues?.puesto === "number"
          ? (defaultValues?.puesto as number)
          : (defaultValues?.puesto as any)?.id ?? undefined,
      fecha_ingreso: defaultValues?.fecha_ingreso ?? "",
      activo: defaultValues?.activo ?? true,

      // ID / Personales / Contacto
      rfc: defaultValues?.rfc ?? "",
      curp: defaultValues?.curp ?? "",
      nss: defaultValues?.nss ?? "",
      fecha_nacimiento: defaultValues?.fecha_nacimiento ?? "",
      genero: defaultValues?.genero ?? "",
      estado_civil: defaultValues?.estado_civil ?? "",
      telefono: defaultValues?.telefono ?? "",
      celular: defaultValues?.celular ?? "",
      email: defaultValues?.email ?? "",

      // Domicilio
      calle: defaultValues?.calle ?? "",
      numero: defaultValues?.numero ?? "",
      colonia: defaultValues?.colonia ?? "",
      municipio: defaultValues?.municipio ?? "",
      estado: defaultValues?.estado ?? "",
      cp: defaultValues?.cp ?? "",

      // Laboral
      sueldo: (defaultValues?.sueldo as any) ?? "",
      tipo_contrato: defaultValues?.tipo_contrato ?? "",
      tipo_jornada: defaultValues?.tipo_jornada ?? "",
      turno: defaultValues?.turno ?? "",
      horario: defaultValues?.horario ?? "",

      // Bancario
      banco: defaultValues?.banco ?? "",
      clabe: defaultValues?.clabe ?? "",
      cuenta: defaultValues?.cuenta ?? "",

      // Emergencia / Otros
      contacto_emergencia_nombre: defaultValues?.contacto_emergencia_nombre ?? "",
      contacto_emergencia_telefono: defaultValues?.contacto_emergencia_telefono ?? "",
      escolaridad: defaultValues?.escolaridad ?? "",
      comentarios: defaultValues?.comentarios ?? "",
    },
  });

  // ====== Autofocus primer error
  React.useEffect(() => {
    const first = Object.keys(errors)[0] as keyof EmpleadoFormValues | undefined;
    if (first) setFocus(first as any);
  }, [errors, setFocus]);

  // ====== Draft autosave/restore
  const persistKey = React.useMemo(() => {
    const id = (defaultValues as any)?.id;
    return id ? `empleado:edit:${id}` : "empleado:create";
  }, [defaultValues]);

  // Restaurar (solo cuando no es edición con valores completos)
  React.useEffect(() => {
    if ((defaultValues as any)?.id) return; // en edición ya vienen valores
    const raw = localStorage.getItem(persistKey);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as Partial<EmpleadoFormValues>;
      Object.keys(saved).forEach((k) => {
        // @ts-ignore
        setValue(k, (saved as any)[k], { shouldDirty: false, shouldValidate: false });
      });
    } catch {}
  }, [persistKey, defaultValues, setValue]);

  // Guardar cada cambio (debounced)
  React.useEffect(() => {
    let t: any;
    const sub = watch((vals) => {
      clearTimeout(t);
      t = setTimeout(() => {
        try { localStorage.setItem(persistKey, JSON.stringify(vals)); } catch {}
      }, 300);
    });
    return () => { sub.unsubscribe(); clearTimeout(t); };
  }, [watch, persistKey]);

  const activo = watch("activo");
  const [step, setStep] = React.useState(0);
  const totalSteps = STEPS_META.length;
  const percent = Math.round((step / (totalSteps - 1)) * 100);

  async function nextStep() {
    const fields = STEP_FIELDS[step];
    const ok = fields.length ? await trigger(fields as any, { shouldFocus: true }) : true;
    if (!ok) return;
    if (step < totalSteps - 1) setStep(step + 1);
  }
  function prevStep() {
    if (step > 0) setStep(step - 1);
  }

  // ====== Utils máscaras
  const onlyDigits = (s: string) => s.replace(/\D+/g, "");
  const upperAN = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

  // ====== Paso 0: Alta express
  const StepAltaExpress = (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth label="No. empleado" placeholder="Ej. 00127"
            {...register("num_empleado")}
            error={!!errors.num_empleado} helperText={errors.num_empleado?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" /></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth label="Nombres" placeholder="Nombre(s)"
            {...register("nombres")}
            error={!!errors.nombres} helperText={errors.nombres?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth label="Apellido paterno" placeholder="Paterno"
            {...register("apellido_paterno")}
            error={!!errors.apellido_paterno} helperText={errors.apellido_paterno?.message}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Apellido materno" placeholder="Materno" {...register("apellido_materno")} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Controller
            control={control}
            name="departamento"
            render={({ field }) => {
              const { data: departamentos = [] } = useCatalogo("/v1/departamentos/");
              const value = departamentos.find(d => d.id === Number(field.value)) ?? null;
              return (
                <Autocomplete
                  options={departamentos}
                  value={value}
                  onChange={(_, v) => field.onChange(v?.id ?? undefined)}
                  getOptionLabel={(o: any) => o?.nombre ?? ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Departamento"
                      error={!!errors.departamento}
                      helperText={errors.departamento?.message}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start"><Business fontSize="small" /></InputAdornment>
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
              const { data: puestos = [] } = useCatalogo("/v1/puestos/");
              const value = puestos.find(p => p.id === Number(field.value)) ?? null;
              return (
                <Autocomplete
                  options={puestos}
                  value={value}
                  onChange={(_, v) => field.onChange(v?.id ?? undefined)}
                  getOptionLabel={(o: any) => o?.nombre ?? ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Puesto"
                      error={!!errors.puesto}
                      helperText={errors.puesto?.message}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start"><Work fontSize="small" /></InputAdornment>
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
            fullWidth label="Fecha de ingreso" type="date" InputLabelProps={{ shrink: true }}
            {...register("fecha_ingreso")} error={!!errors.fecha_ingreso} helperText={errors.fecha_ingreso?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><Today fontSize="small" /></InputAdornment> }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth label="Email corporativo" placeholder="nombre@tuempresa.com"
            {...register("email")} error={!!errors.email} helperText={errors.email?.message}
            InputProps={{ startAdornment: <InputAdornment position="start"><Mail fontSize="small" /></InputAdornment> }}
          />
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ opacity: .75 }}>Estado:</Typography>
              <Switch checked={!!activo} onChange={(e)=>setValue("activo", e.target.checked)} />
              <Typography variant="body2" fontWeight={600}>{activo ? "Activo" : "Inactivo"}</Typography>
            </Stack>
            <Typography variant="body2" sx={{ opacity: .6 }}>
              Completa lo esencial y continúa con los detalles.
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );

  // ====== Paso 1: ID / Personales & Contacto (con máscaras y toggles)
  const StepIdPersonal = (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">Identificación</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="RFC" {...register("rfc")}
              inputProps={{ maxLength: 13 }}
              onChange={(e) => { e.target.value = upperAN(e.target.value).slice(0,13); }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="CURP" {...register("curp")}
              inputProps={{ maxLength: 18 }}
              onChange={(e) => { e.target.value = upperAN(e.target.value).slice(0,18); }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="NSS" {...register("nss")}
              inputProps={{ maxLength: 11 }}
              onChange={(e) => { e.target.value = onlyDigits(e.target.value).slice(0,11); }}
            />
          </Grid>
        </Grid>
        <Divider />
        <Typography variant="subtitle2">Personales & Contacto</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Fecha de nacimiento" type="date" InputLabelProps={{ shrink: true }} {...register("fecha_nacimiento")} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              control={control}
              name="genero"
              render={({ field }) => (
                <ToggleButtonGroup
                  exclusive
                  value={field.value || ""}
                  onChange={(_, v) => field.onChange(v ?? "")}
                  size="small"
                >
                  {GENEROS.map(g => <ToggleButton key={g.value} value={g.value}>{g.label}</ToggleButton>)}
                </ToggleButtonGroup>
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Controller
              control={control}
              name="estado_civil"
              render={({ field }) => (
                <ToggleButtonGroup
                  exclusive
                  value={field.value || ""}
                  onChange={(_, v) => field.onChange(v ?? "")}
                  size="small"
                >
                  {ESTADOS_CIVIL.map(e => <ToggleButton key={e.value} value={e.value}>{e.label}</ToggleButton>)}
                </ToggleButtonGroup>
              )}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Teléfono" {...register("telefono")}
              onChange={(e)=>{ e.target.value = onlyDigits(e.target.value).slice(0,10); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Phone fontSize="small" /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Celular" {...register("celular")}
              onChange={(e)=>{ e.target.value = onlyDigits(e.target.value).slice(0,10); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphone fontSize="small" /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Email" {...register("email")}
              error={!!errors.email} helperText={errors.email?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><Mail fontSize="small" /></InputAdornment> }} />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );

  const StepAddress = (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><TextField fullWidth label="Calle" {...register("calle")} /></Grid>
        <Grid item xs={12} md={2}><TextField fullWidth label="Número" {...register("numero")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Colonia" {...register("colonia")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Municipio" {...register("municipio")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Estado" {...register("estado")} /></Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="CP" {...register("cp")}
            onChange={(e)=>{ e.target.value = onlyDigits(e.target.value).slice(0,5); }} />
        </Grid>
      </Grid>
    </Paper>
  );

  const StepLabor = (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><TextField fullWidth label="Sueldo (MXN)" {...register("sueldo")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Tipo de contrato" {...register("tipo_contrato")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Tipo de jornada" {...register("tipo_jornada")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Turno" {...register("turno")} /></Grid>
        <Grid item xs={12} md={8}><TextField fullWidth label="Horario" {...register("horario")} /></Grid>
      </Grid>
    </Paper>
  );

  const StepBank = (
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

  const StepEmergency = (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}><TextField fullWidth label="Contacto de emergencia" {...register("contacto_emergencia_nombre")} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Teléfono de emergencia" {...register("contacto_emergencia_telefono")}
          onChange={(e)=>{ e.target.value = onlyDigits(e.target.value).slice(0,10); }} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Escolaridad" {...register("escolaridad")} /></Grid>
        <Grid item xs={12} md={6}><TextField fullWidth label="Comentarios" {...register("comentarios")} /></Grid>
      </Grid>
    </Paper>
  );

  const vals = getValues();
  const StepReview = (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ opacity: .8 }}>Revisa que todo esté correcto antes de {submitLabel.toLowerCase()}.</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom><Person sx={{ mr: .5 }} fontSize="small" /> Alta express</Typography>
            <InfoLine k="No. empleado" v={vals.num_empleado} />
            <InfoLine k="Nombre" v={`${vals.nombres} ${vals.apellido_paterno} ${vals.apellido_materno ?? ""}`} />
            <InfoLine k="Departamento" v={(useCatalogo("/v1/departamentos/").data ?? []).find((d:any)=>d.id===Number(vals.departamento))?.nombre ?? vals.departamento} />
            <InfoLine k="Puesto" v={(useCatalogo("/v1/puestos/").data ?? []).find((p:any)=>p.id===Number(vals.puesto))?.nombre ?? vals.puesto} />
            <InfoLine k="Ingreso" v={vals.fecha_ingreso} />
            <InfoLine k="Email" v={vals.email} />
            <InfoLine k="Estado" v={vals.activo ? "Activo" : "Inactivo"} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom><AssignmentInd sx={{ mr: .5 }} fontSize="small" /> ID / Personales</Typography>
            <InfoLine k="RFC" v={vals.rfc} />
            <InfoLine k="CURP" v={vals.curp} />
            <InfoLine k="NSS" v={vals.nss} />
            <InfoLine k="Nacimiento" v={vals.fecha_nacimiento} />
            <InfoLine k="Género" v={vals.genero} />
            <InfoLine k="Estado civil" v={vals.estado_civil} />
            <InfoLine k="Tel./Cel." v={`${vals.telefono ?? ""}  ${vals.celular ?? ""}`} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom><Home sx={{ mr: .5 }} fontSize="small" /> Domicilio</Typography>
            <InfoLine k="Dirección" v={`${vals.calle ?? ""} ${vals.numero ?? ""}, ${vals.colonia ?? ""}, ${vals.municipio ?? ""}, ${vals.estado ?? ""}, CP ${vals.cp ?? ""}`} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom><Work sx={{ mr: .5 }} fontSize="small" /> Laboral</Typography>
            <InfoLine k="Sueldo" v={String(vals.sueldo ?? "")} />
            <InfoLine k="Contrato" v={vals.tipo_contrato} />
            <InfoLine k="Jornada" v={vals.tipo_jornada} />
            <InfoLine k="Turno" v={vals.turno} />
            <InfoLine k="Horario" v={vals.horario} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom><AccountBalance sx={{ mr: .5 }} fontSize="small" /> Bancario</Typography>
            <InfoLine k="Banco" v={vals.banco} />
            <InfoLine k="CLABE" v={vals.clabe} />
            <InfoLine k="Cuenta" v={vals.cuenta} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom><LocalHospital sx={{ mr: .5 }} fontSize="small" /> Emergencia & Otros</Typography>
            <InfoLine k="Contacto" v={vals.contacto_emergencia_nombre} />
            <InfoLine k="Tel. emergencia" v={vals.contacto_emergencia_telefono} />
            <InfoLine k="Escolaridad" v={vals.escolaridad} />
            <InfoLine k="Comentarios" v={vals.comentarios} />
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );

  const body = (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
        <Typography variant="h6" fontWeight={800}>{submitLabel === "Crear" ? "Alta de empleado" : "Editar empleado"}</Typography>
        <Typography variant="body2" sx={{ opacity:.8 }}>Paso {step + 1} de {totalSteps}</Typography>
      </Stack>

      <Box>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 1 }}>
          {STEPS_META.map((s, i) => (
            <Step key={i}>
              <StepLabel icon={s.icon}>{s.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <LinearProgress variant="determinate" value={percent} sx={{ height: 6, borderRadius: 1 }} />
      </Box>

      {error && <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}

      {step === 0 && StepAltaExpress}
      {step === 1 && StepIdPersonal}
      {step === 2 && StepAddress}
      {step === 3 && StepLabor}
      {step === 4 && StepBank}
      {step === 5 && StepEmergency}
      {step === 6 && StepReview}

      <Divider sx={{ my: 1 }} />

      <Stack direction="row" spacing={1} justifyContent="space-between">
        <Button onClick={prevStep} disabled={step === 0}>Anterior</Button>
        {step < totalSteps - 1 ? (
          <Button onClick={nextStep} variant="contained">Siguiente</Button>
        ) : (
          <Button type="submit" form="__form" variant="contained" disabled={loading}>
            {loading ? "Guardando..." : submitLabel}
          </Button>
        )}
      </Stack>
    </Stack>
  );

  // Submit real (con RHF)
  const hiddenForm = (
    <form id="__form" onSubmit={handleSubmit(onSubmit)} style={{ display: "none" }}>
      <button type="submit" />
    </form>
  );

  const content = (
    <>
      {body}
      {hiddenForm}
    </>
  );

  if (wrapInPaper) {
    return <Paper sx={{ p: 2 }}>{content}</Paper>;
  }
  return <Box sx={{ pt: 1 }}>{content}</Box>;
}

// Línea informativa de revisión
function InfoLine({ k, v }: { k: string; v?: any }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: .25 }}>
      <Typography variant="body2" sx={{ opacity:.7 }}>{k}</Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right" sx={{ ml: 2, wordBreak: "break-word" }}>
        {v ?? ""}
      </Typography>
    </Stack>
  );
}

