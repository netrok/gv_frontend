import { z } from "zod";

export const empleadoSchema = z.object({
  // Básicos
  num_empleado: z.string().min(1),
  nombres: z.string().min(1),
  apellido_paterno: z.string().min(1),
  apellido_materno: z.string().optional().nullable(),
  departamento_id: z.number().optional().nullable(),
  puesto_id: z.number().optional().nullable(),
  fecha_ingreso: z.string().optional().nullable(),
  activo: z.boolean().default(true),

  // Personales / Contacto
  rfc: z.string().optional().nullable(),
  curp: z.string().optional().nullable(),
  nss: z.string().optional().nullable(),
  fecha_nacimiento: z.string().optional().nullable(),
  genero: z.string().optional().nullable(),
  estado_civil: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  celular: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),

  // Domicilio
  calle: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  colonia: z.string().optional().nullable(),
  municipio: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  cp: z.string().optional().nullable(),

  // Laboral
  sueldo: z.union([z.number(), z.string()]).optional().nullable(),
  tipo_contrato: z.string().optional().nullable(),
  tipo_jornada: z.string().optional().nullable(),
  turno_id: z.number().optional().nullable(),
  horario_id: z.number().optional().nullable(),

  // Bancario
  banco: z.string().optional().nullable(),
  clabe: z.string().optional().nullable(),
  cuenta: z.string().optional().nullable(),

  // Emergencia / Otros
  contacto_emergencia_nombre: z.string().optional().nullable(),
  contacto_emergencia_parentesco: z.string().optional().nullable(),
  contacto_emergencia_telefono: z.string().optional().nullable(),
  escolaridad: z.string().optional().nullable(),
  notas: z.string().optional().nullable(),

  // Archivo
  foto: z.any().optional(),
});

// IMPORTANTE: usa la misma forma tanto para el form como para el payload
export type EmpleadoFormInputs = z.infer<typeof empleadoSchema>;
export type EmpleadoFormValues = EmpleadoFormInputs;
