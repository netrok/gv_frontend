export type Empleado = {
  id: number
  num_empleado: string
  nombres: string
  apellido_paterno: string
  apellido_materno?: string
  fecha_nacimiento?: string
  genero?: string
  estado_civil?: string
  curp?: string
  rfc?: string
  nss?: string
  telefono?: string
  email?: string
  puesto?: any
  departamento?: any
  fecha_ingreso?: string
  activo?: boolean
  foto?: string | null
}