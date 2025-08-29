// src/pages/empleados/EmpleadoForm.tsx
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert, Box, Button, Divider, Grid, Paper, Stack, Typography,
  Stepper, Step, StepLabel, LinearProgress
} from "@mui/material";
import { Person, AssignmentInd, Home, Work, AccountBalance, LocalHospital, DoneAll } from "@mui/icons-material";
import { useForm, type SubmitHandler } from "react-hook-form";

import { empleadoSchema, type EmpleadoFormInputs, type EmpleadoFormValues } from "@/features/empleados/utils/schema";
import { useCatalogo } from "./form/useCatalogo";
import InfoLine from "./form/InfoLine";

import StepAltaExpress from "./form/StepAltaExpress";
import StepIdPersonal from "./form/StepIdPersonal";
import StepAddress from "./form/StepAddress";
import StepLabor from "./form/StepLabor";
import StepBank from "./form/StepBank";
import StepEmergency from "./form/StepEmergency";

export default function EmpleadoForm({
  defaultValues,
  onSubmit,
  loading = false,
  error,
  submitLabel = "Guardar",
  wrapInPaper = true,
}: {
  defaultValues?: Partial<EmpleadoFormValues>;
  onSubmit: (values: EmpleadoFormInputs) => void | Promise<void>; // ← simplificado
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
  wrapInPaper?: boolean;
}) {
  const { data: departamentos = [] } = useCatalogo("/v1/departamentos/");
  const { data: puestos = [] } = useCatalogo("/v1/puestos/");
  const { data: turnos = [] } = useCatalogo("/v1/turnos/");
  const { data: horarios = [] } = useCatalogo("/v1/horarios/");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
    setFocus,
    control,
  } = useForm<EmpleadoFormInputs>({
    resolver: zodResolver(empleadoSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    defaultValues: {
      // Básicos
      num_empleado: defaultValues?.num_empleado ?? "",
      nombres: defaultValues?.nombres ?? "",
      apellido_paterno: defaultValues?.apellido_paterno ?? "",
      apellido_materno: (defaultValues as any)?.apellido_materno ?? undefined,
      departamento_id:
        typeof (defaultValues as any)?.departamento_id === "number"
          ? (defaultValues as any).departamento_id
          : (defaultValues as any)?.departamento?.id ?? undefined,
      puesto_id:
        typeof (defaultValues as any)?.puesto_id === "number"
          ? (defaultValues as any).puesto_id
          : (defaultValues as any)?.puesto?.id ?? undefined,
      fecha_ingreso: (defaultValues as any)?.fecha_ingreso ?? "",
      activo: (defaultValues as any)?.activo ?? true,

      // ID / Personales / Contacto
      rfc: (defaultValues as any)?.rfc ?? "",
      curp: (defaultValues as any)?.curp ?? "",
      nss: (defaultValues as any)?.nss ?? "",
      fecha_nacimiento: (defaultValues as any)?.fecha_nacimiento ?? "",
      genero: (defaultValues as any)?.genero ?? "",
      estado_civil: (defaultValues as any)?.estado_civil ?? "",
      telefono: (defaultValues as any)?.telefono ?? "",
      celular: (defaultValues as any)?.celular ?? "",
      email: (defaultValues as any)?.email ?? "",

      // Domicilio
      calle: (defaultValues as any)?.calle ?? "",
      numero: (defaultValues as any)?.numero ?? "",
      colonia: (defaultValues as any)?.colonia ?? "",
      municipio: (defaultValues as any)?.municipio ?? "",
      estado: (defaultValues as any)?.estado ?? "",
      cp: (defaultValues as any)?.cp ?? "",

      // Laboral
      sueldo: (defaultValues as any)?.sueldo ?? "",
      tipo_contrato: (defaultValues as any)?.tipo_contrato ?? "",
      tipo_jornada: (defaultValues as any)?.tipo_jornada ?? "",
      turno_id:
        typeof (defaultValues as any)?.turno_id === "number"
          ? (defaultValues as any).turno_id
          : (defaultValues as any)?.turno?.id ?? undefined,
      horario_id:
        typeof (defaultValues as any)?.horario_id === "number"
          ? (defaultValues as any).horario_id
          : (defaultValues as any)?.horario?.id ?? undefined,

      // Bancario
      banco: (defaultValues as any)?.banco ?? "",
      clabe: (defaultValues as any)?.clabe ?? "",
      cuenta: (defaultValues as any)?.cuenta ?? "",

      // Emergencia / Otros
      contacto_emergencia_nombre: (defaultValues as any)?.contacto_emergencia_nombre ?? "",
      contacto_emergencia_parentesco: (defaultValues as any)?.contacto_emergencia_parentesco ?? "",
      contacto_emergencia_telefono: (defaultValues as any)?.contacto_emergencia_telefono ?? "",
      escolaridad: (defaultValues as any)?.escolaridad ?? "",
      notas: (defaultValues as any)?.notas ?? "",

      // Archivo
      foto: undefined as any,
    },
  });

  // Autofocus primer error
  React.useEffect(() => {
    const first = Object.keys(errors)[0] as keyof EmpleadoFormInputs | undefined;
    if (first) setFocus(first as any);
  }, [errors, setFocus]);

  // Draft autosave/restore
  const persistKey = React.useMemo(() => {
    const id = (defaultValues as any)?.id;
    return id ? `empleado:edit:${id}` : "empleado:create";
  }, [defaultValues]);

  React.useEffect(() => {
    if ((defaultValues as any)?.id) return;
    const raw = localStorage.getItem(persistKey);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as Partial<EmpleadoFormInputs>;
      Object.keys(saved).forEach((k) => {
        setValue(k as any, (saved as any)[k], { shouldDirty: false, shouldValidate: false });
      });
    } catch {}
  }, [persistKey, defaultValues, setValue]);

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

  // Navegación de pasos
  const [step, setStep] = React.useState(0);
  const STEPS_META = [
    { label: "Alta express", icon: <Person fontSize="small" /> },
    { label: "ID / Personales", icon: <AssignmentInd fontSize="small" /> },
    { label: "Domicilio", icon: <Home fontSize="small" /> },
    { label: "Laboral", icon: <Work fontSize="small" /> },
    { label: "Bancario", icon: <AccountBalance fontSize="small" /> },
    { label: "Emergencia & Otros", icon: <LocalHospital fontSize="small" /> },
    { label: "Revisión", icon: <DoneAll fontSize="small" /> },
  ];
  const STEP_FIELDS: string[][] = [
    ["num_empleado","nombres","apellido_paterno","apellido_materno","departamento_id","puesto_id","fecha_ingreso","activo","email"],
    ["rfc","curp","nss","fecha_nacimiento","genero","estado_civil","telefono","celular"], // ← quitamos email duplicado
    ["calle","numero","colonia","municipio","estado","cp"],
    ["sueldo","tipo_contrato","tipo_jornada","turno_id","horario_id"],
    ["banco","clabe","cuenta"],
    ["contacto_emergencia_nombre","contacto_emergencia_parentesco","contacto_emergencia_telefono","escolaridad","notas"],
    [],
  ];

  const totalSteps = STEPS_META.length;
  const percent = Math.round((step / (totalSteps - 1)) * 100);

  async function nextStep() {
    const fields = STEP_FIELDS[step];
    const ok = fields.length ? await trigger(fields as any, { shouldFocus: true }) : true;
    if (!ok) return;
    if (step < totalSteps - 1) setStep(step + 1);
  }
  function prevStep() { if (step > 0) setStep(step - 1); }

  // Evitar submit con Enter antes de Revisión
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step < totalSteps - 1) {
      e.preventDefault();
      nextStep();
    }
  };

  // Render de pasos
  const activo = (watch("activo") as boolean | undefined) ?? true;
  const vals = getValues();

  const steps = [
    <StepAltaExpress
      key="alta"
      control={control}
      register={register}
      errors={errors}
      setValue={setValue}
      activo={activo}
      departamentos={departamentos}
      puestos={puestos}
      fotoUrl={(defaultValues as any)?.foto_url}
    />,
    <StepIdPersonal key="id" register={register} errors={errors} />,
    <StepAddress key="dir" register={register} />,
    <StepLabor key="lab" register={register} errors={errors} turnos={turnos} horarios={horarios} />,
    <StepBank key="ban" register={register} />,
    <StepEmergency key="eme" register={register} />,
    <Stack key="rev" spacing={2}>
      <Typography variant="subtitle2" sx={{ opacity: .8 }}>
        Revisa que todo esté correcto antes de {submitLabel.toLowerCase()}.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom>Alta express</Typography>
            <InfoLine k="No. empleado" v={vals.num_empleado} />
            <InfoLine k="Nombre" v={`${vals.nombres} ${vals.apellido_paterno} ${vals.apellido_materno ?? ""}`} />
            <InfoLine k="Departamento" v={departamentos.find((d: any) => d.id === Number(vals.departamento_id))?.nombre ?? vals.departamento_id} />
            <InfoLine k="Puesto" v={puestos.find((p: any) => p.id === Number(vals.puesto_id))?.nombre ?? vals.puesto_id} />
            <InfoLine k="Ingreso" v={vals.fecha_ingreso} />
            <InfoLine k="Email" v={vals.email} />
            <InfoLine k="Estado" v={vals.activo ? "Activo" : "Inactivo"} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom>ID / Personales</Typography>
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
            <Typography fontWeight={700} gutterBottom>Domicilio</Typography>
            <InfoLine k="Dirección" v={`${vals.calle ?? ""} ${vals.numero ?? ""}, ${vals.colonia ?? ""}, ${vals.municipio ?? ""}, ${vals.estado ?? ""}, CP ${vals.cp ?? ""}`} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom>Laboral</Typography>
            <InfoLine k="Sueldo" v={String(vals.sueldo ?? "")} />
            <InfoLine k="Contrato" v={vals.tipo_contrato} />
            <InfoLine k="Jornada" v={vals.tipo_jornada} />
            <InfoLine k="Turno" v={turnos.find((t: any) => t.id === Number(vals.turno_id))?.nombre ?? vals.turno_id} />
            <InfoLine k="Horario" v={horarios.find((h: any) => h.id === Number(vals.horario_id))?.nombre ?? vals.horario_id} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom>Bancario</Typography>
            <InfoLine k="Banco" v={vals.banco} />
            <InfoLine k="CLABE" v={vals.clabe} />
            <InfoLine k="Cuenta" v={vals.cuenta} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography fontWeight={700} gutterBottom>Emergencia & Otros</Typography>
            <InfoLine k="Contacto" v={vals.contacto_emergencia_nombre} />
            <InfoLine k="Parentesco" v={vals.contacto_emergencia_parentesco} />
            <InfoLine k="Tel. emergencia" v={vals.contacto_emergencia_telefono} />
            <InfoLine k="Escolaridad" v={vals.escolaridad} />
            <InfoLine k="Notas" v={vals.notas} />
          </Paper>
        </Grid>
      </Grid>
    </Stack>,
  ];

  const submit: SubmitHandler<EmpleadoFormInputs> = (values) => onSubmit(values);

  const body = (
    <Stack spacing={2} onKeyDown={onKeyDown}>
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
        <Typography variant="h6" fontWeight={800}>{submitLabel === "Crear" ? "Alta de empleado" : "Editar empleado"}</Typography>
        <Typography variant="body2" sx={{ opacity:.8 }}>Paso {step + 1} de {totalSteps}</Typography>
      </Stack>

      <Box>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 1 }}>
          {STEPS_META.map((s, i) => (
            <Step key={i}><StepLabel icon={s.icon}>{s.label}</StepLabel></Step>
          ))}
        </Stepper>
        <LinearProgress variant="determinate" value={percent} sx={{ height: 6, borderRadius: 1 }} />
      </Box>

      {error && <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>{error}</Alert>}
      {steps[step]}

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

  return wrapInPaper ? (
    <>
      <Paper sx={{ p: 2 }}>{body}</Paper>
      <form id="__form" onSubmit={handleSubmit(submit)} style={{ display: "none" }}>
        <button type="submit" />
      </form>
    </>
  ) : (
    <>
      <Box sx={{ pt: 1 }}>{body}</Box>
      <form id="__form" onSubmit={handleSubmit(submit)} style={{ display: "none" }}>
        <button type="submit" />
      </form>
    </>
  );
}
