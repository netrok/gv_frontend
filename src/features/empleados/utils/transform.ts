import type { EmpleadoFormValues } from "../../../pages/empleados/form/schema";

// Convierte vacíos a null, fuerza números en FKs y booleans correctos
export function toApiEmpleado(values: EmpleadoFormValues) {
  const v = { ...values };

  // FKs como ID numérico o null
  const dept = (v as any).departamento;
  const pue  = (v as any).puesto;
  (v as any).departamento = dept === "" || dept == null ? null : Number(dept);
  (v as any).puesto       = pue  === "" || pue  == null ? null : Number(pue);

  // Fechas: vacío -> null (DRF suele esperar null en vez de "")
  (v as any).fecha_ingreso     = (v as any).fecha_ingreso     ? (v as any).fecha_ingreso     : null;
  (v as any).fecha_nacimiento  = (v as any).fecha_nacimiento  ? (v as any).fecha_nacimiento  : null;

  // Boolean sólido
  (v as any).activo = !!(v as any).activo;

  // Limpia cualquier campo de solo UI si existiera
  delete (v as any).__localDraft;

  return v as any;
}
