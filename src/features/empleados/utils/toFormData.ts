// src/features/empleados/utils/toFormData.ts
import type { EmpleadoFormInputs, EmpleadoFormValues } from "./schema";

const FIELDS = [
  "num_empleado","nombres","apellido_paterno","apellido_materno",
  "fecha_nacimiento","genero","estado_civil","curp","rfc","nss","telefono","celular","email",
  "calle","numero","colonia","municipio","estado","cp",
  "departamento_id","puesto_id","fecha_ingreso","activo",
  "sueldo","tipo_contrato","tipo_jornada","turno_id","horario_id",
  "banco","clabe","cuenta",
  "contacto_emergencia_nombre","contacto_emergencia_parentesco","contacto_emergencia_telefono",
  "escolaridad","notas",
] as const;

type Values = EmpleadoFormInputs | EmpleadoFormValues;

export function toFormData(values: Values) {
  const fd = new FormData();
  for (const k of FIELDS) {
    const v = (values as any)[k];
    if (v === undefined || v === null || v === "") continue;
    fd.append(k, typeof v === "number" || typeof v === "boolean" ? String(v) : String(v));
  }

  // Foto (File o FileList / array)
  const raw = (values as any).foto;
  const file =
    raw instanceof File ? raw :
    (typeof FileList !== "undefined" && raw instanceof FileList) ? raw[0] :
    Array.isArray(raw) ? raw[0] :
    undefined;

  if (file) fd.append("foto", file);
  return fd;
}
