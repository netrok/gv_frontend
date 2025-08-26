import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert, Box, Button, Divider, Grid, MenuItem, Paper, Stack, Switch, TextField, Typography,
  Stepper, Step, StepLabel, LinearProgress
} from "@mui/material";
import {
  Person, AssignmentInd, ContactPhone, Home, Work, AccountBalance, LocalHospital, DoneAll
} from "@mui/icons-material";
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

// ======= Esquema global (seguimos con zod)
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

// ======= Helpers
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

function labelFromId(list: {id:number;nombre:string}[], id?: number | null) {
  if (id == null) return "";
  const item = list.find(x => x.id === id);
  return item?.nombre ?? id;
}

// ======= Campos por paso (para validar con RHF.trigger)
const STEP_FIELDS: string[][] = [
  // 0: Básicos
  ["num_empleado","nombres","apellido_paterno","apellido_materno","departamento","puesto","fecha_ingreso","activo"],
  // 1: Identificación + Personales & Contacto
  ["rfc","curp","nss","fecha_nacimiento","genero","estado_civil","telefono","celular","email"],
  // 2: Domicilio
  ["calle","numero","colonia","municipio","estado","cp"],
  // 3: Laboral
  ["sueldo","tipo_contrato","tipo_jornada","turno","horario"],
  // 4: Bancario
  ["banco","clabe","cuenta"],
  // 5: Emergencia & Otros
  ["contacto_emergencia_nombre","contacto_emergencia_telefono","escolaridad","comentarios"],
  // 6: Revisión (no inputs obligatorios)
  [],
];

const STEPS_META = [
  { label: "Básicos", icon: <Person fontSize="small" /> },
  { label: "ID / Personales", icon: <AssignmentInd fontSize="small" /> },
  { label: "Domicilio", icon: <Home fontSize="small" /> },
  { label: "Laboral", icon: <Work fontSize="small" /> },
  { label: "Bancario", icon: <AccountBalance fontSize="small" /> },
  { label: "Emergencia & Otros", icon: <LocalHospital fontSize="small" /> },
  { label: "Revisión", icon: <DoneAll fontSize="small" /> },
];

// ======= Componente
export default function EmpleadoForm({
  defaultValues,
  onSubmit,
  loading = false,
  error,
  submitLabel = "Guardar",
  wrapInPaper = true, // para usar sin Paper dentro de modal
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
    register, handleSubmit, formState: { errors }, watch, setValue, trigger, getValues
  } = useForm<EmpleadoFormValues>({
    resolver: zodResolver(schema),
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

  const activo = watch("activo");
  const [step, setStep] = React.useState(0);
  const totalSteps = STEPS_META.length;
  const percent = Math.round((step / (totalSteps - 1)) * 100);

  async function nextStep() {
    // valida SOLO los campos del paso actual
    const fields = STEP_FIELDS[step];
    const ok = fields.length ? await trigger(fields as any, { shouldFocus: true }) : true;
    if (!ok) return;
    if (step < totalSteps - 1) setStep(step + 1);
  }
  function prevStep() {
    if (step > 0) setStep(step - 1);
  }

  // ======= UI por paso
  const StepBasics = (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <TextField fullWidth label="No. empleado" {...register("num_empleado")}
          error={!!errors.num_empleado} helperText={errors.num_empleado?.message}/>
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField fullWidth label="Nombres" {...register("nombres")}
          error={!!errors.nombres} helperText={errors.nombres?.message}/>
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField fullWidth label="Apellido paterno" {...register("apellido_paterno")}
          error={!!errors.apellido_paterno} helperText={errors.apellido_paterno?.message}/>
      </Grid>
      <Grid item xs={12} md={3}>
        <TextField fullWidth label="Apellido materno" {...register("apellido_materno")}
          error={!!errors.apellido_materno} helperText={errors.apellido_materno?.message}/>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField select fullWidth label="Departamento" {...register("departamento")}
          error={!!errors.departamento} helperText={errors.departamento?.message}>
          {departamentos.map((d: Departamento) => <MenuItem key={d.id} value={d.id}>{d.nombre}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField select fullWidth label="Puesto" {...register("puesto")}
          error={!!errors.puesto} helperText={errors.puesto?.message}>
          {puestos.map((p: Puesto) => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
        </TextField>
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField fullWidth label="Fecha de ingreso" type="date" InputLabelProps={{ shrink: true }}
          {...register("fecha_ingreso")} error={!!errors.fecha_ingreso} helperText={errors.fecha_ingreso?.message}/>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ opacity: .75 }}>Estado:</Typography>
          <Switch checked={!!activo} onChange={(e)=>setValue("activo", e.target.checked)} />
          <Typography variant="body2" fontWeight={600}>{activo ? "Activo" : "Inactivo"}</Typography>
        </Stack>
      </Grid>
    </Grid>
  );

  const StepIdPersonal = (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Identificación</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><TextField fullWidth label="RFC" {...register("rfc")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="CURP" {...register("curp")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="NSS" {...register("nss")} /></Grid>
      </Grid>
      <Divider />
      <Typography variant="subtitle2">Personales & Contacto</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="Fecha de nacimiento" type="date" InputLabelProps={{ shrink: true }} {...register("fecha_nacimiento")} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField select fullWidth label="Género" {...register("genero")}>
            {GENEROS.map(g => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField select fullWidth label="Estado civil" {...register("estado_civil")}>
            {ESTADOS_CIVIL.map(e => <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Teléfono" {...register("telefono")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Celular" {...register("celular")} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth label="Email" {...register("email")}
          error={!!errors.email} helperText={errors.email?.message} /></Grid>
      </Grid>
    </Stack>
  );

  const StepAddress = (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}><TextField fullWidth label="Calle" {...register("calle")} /></Grid>
      <Grid item xs={12} md={2}><TextField fullWidth label="Número" {...register("numero")} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Colonia" {...register("colonia")} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Municipio" {...register("municipio")} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Estado" {...register("estado")} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="CP" {...register("cp")} /></Grid>
    </Grid>
  );

  const StepLabor = (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}><TextField fullWidth label="Sueldo" {...register("sueldo")} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Tipo de contrato" {...register("tipo_contrato")} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Tipo de jornada" {...register("tipo_jornada")} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Turno" {...register("turno")} /></Grid>
      <Grid item xs={12} md={8}><TextField fullWidth label="Horario" {...register("horario")} /></Grid>
    </Grid>
  );

  const StepBank = (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}><TextField fullWidth label="Banco" {...register("banco")} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="CLABE" {...register("clabe")} /></Grid>
      <Grid item xs={12} md={4}><TextField fullWidth label="Cuenta" {...register("cuenta")} /></Grid>
    </Grid>
  );

  const StepEmergency = (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}><TextField fullWidth label="Contacto de emergencia" {...register("contacto_emergencia_nombre")} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Teléfono de emergencia" {...register("contacto_emergencia_telefono")} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Escolaridad" {...register("escolaridad")} /></Grid>
      <Grid item xs={12} md={6}><TextField fullWidth label="Comentarios" {...register("comentarios")} /></Grid>
    </Grid>
  );

  const vals = getValues();
  const StepReview = (
    <Stack spacing={2}>
      <Typography variant="subtitle2" sx={{ opacity: .8 }}>Revisa que todo esté correcto antes de {submitLabel.toLowerCase()}.</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom><Person sx={{ mr: .5 }} fontSize="small" /> Básicos</Typography>
            <InfoLine k="No. empleado" v={vals.num_empleado} />
            <InfoLine k="Nombre" v={`${vals.nombres} ${vals.apellido_paterno} ${vals.apellido_materno ?? ""}`} />
            <InfoLine k="Departamento" v={labelFromId(departamentos, Number(vals.departamento))} />
            <InfoLine k="Puesto" v={labelFromId(puestos, Number(vals.puesto))} />
            <InfoLine k="Ingreso" v={vals.fecha_ingreso} />
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
            <InfoLine k="Email" v={vals.email} />
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
      {/* Encabezado corporativo */}
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
        <Typography variant="h6" fontWeight={800}>Alta de empleado</Typography>
        <Typography variant="body2" sx={{ opacity:.8 }}>Paso {step + 1} de {totalSteps}</Typography>
      </Stack>

      {/* Stepper + progreso */}
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

      {/* Contenido de cada fase */}
      {step === 0 && StepBasics}
      {step === 1 && StepIdPersonal}
      {step === 2 && StepAddress}
      {step === 3 && StepLabor}
      {step === 4 && StepBank}
      {step === 5 && StepEmergency}
      {step === 6 && StepReview}

      <Divider sx={{ my: 1 }} />

      {/* Acciones */}
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

  // IMPORTANTE: el submit real va atado a un form invisible para que el botón final funcione con RHF
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

// Línea informativa de revisión (k: etiqueta, v: valor)
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
