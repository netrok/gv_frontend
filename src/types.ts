export interface Departamento {
  id: number;
  nombre: string;
  clave?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface Puesto {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  departamento?: number | { id: number; nombre: string };
}

export interface Empleado {
  id: number;
  num_empleado: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  departamento: number | { id: number; nombre: string };
  puesto: number | { id: number; nombre: string };
  fecha_ingreso?: string;
  activo?: boolean;
  //  (resto de campos que ya tengas)
}

