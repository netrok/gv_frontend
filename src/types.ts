export type Paginated<T> = { count: number; results: T[] };

export type Departamento = { id: number; nombre: string };
export type Puesto = { id: number; nombre: string };

export type Empleado = {
  id: number;
  num_empleado: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  departamento: number | Departamento;
  puesto: number | Puesto;
  fecha_ingreso?: string; // YYYY-MM-DD
  activo: boolean;

  // --- Extras comunes ---
  rfc?: string; curp?: string; nss?: string;
  fecha_nacimiento?: string; // YYYY-MM-DD
  genero?: string; estado_civil?: string;
  telefono?: string; celular?: string; email?: string;

  // Domicilio
  calle?: string; numero?: string; colonia?: string;
  municipio?: string; estado?: string; cp?: string;

  // Laborales
  sueldo?: number | string; tipo_contrato?: string; tipo_jornada?: string; turno?: string; horario?: string;

  // Bancarios
  banco?: string; clabe?: string; cuenta?: string;

  // Emergencia
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;

  // Otros
  escolaridad?: string; comentarios?: string;

  [k: string]: any;
};
