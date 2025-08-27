import { z } from "zod";

export const empleadoSchema = z.object({
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

export type EmpleadoFormValues = z.output<typeof empleadoSchema>; // output validado
export type EmpleadoFormInputs = z.input<typeof empleadoSchema>;  // input RHF
