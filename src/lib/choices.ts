import api from "./api";

type ChoiceItem = { value: any; display_name?: string; label?: string; [k: string]: any };
type ChoicesMap = Record<string, Array<{ value: any; label: string }>>;

function normalizeChoices(list: ChoiceItem[] | undefined): Array<{ value: any; label: string }> {
  if (!Array.isArray(list)) return [];
  return list.map((c: any) => ({
    value: c.value ?? c[0] ?? c.key ?? c.code ?? c,
    label: c.display_name ?? c.label ?? c[1] ?? String(c),
  }));
}

/** Lee OPTIONS y devuelve choices de los campos clave del empleado */
export async function fetchEmpleadoChoices(): Promise<ChoicesMap> {
  const { data } = await api.options("/v1/empleados/");
  const fields = data?.actions?.POST ?? {};
  const pick = ["genero", "estado_civil", "contrato", "jornada", "turno"];
  const out: ChoicesMap = {};
  for (const f of pick) out[f] = normalizeChoices(fields[f]?.choices);
  return out;
}

/** Intenta mapear el texto del usuario (ej. "casado") al value real (ej. "C" o "CASADO") */
export function mapChoiceValue(field: string, input: any, choices: ChoicesMap): any {
  if (input === undefined || input === null || input === "") return input;
  const list = choices[field];
  if (!list || list.length === 0) {
    // fallback conservador: mayúsculas
    return typeof input === "string" ? input.toUpperCase() : input;
  }
  const needle = String(input).trim().toLowerCase();

  // 1) por label exacto (case-insensitive)
  const byLabel = list.find((c) => String(c.label).trim().toLowerCase() === needle);
  if (byLabel) return byLabel.value;

  // 2) por value si mandaron ya el código como texto
  const byValue = list.find((c) => String(c.value).trim().toLowerCase() === needle);
  if (byValue) return byValue.value;

  // 3) por primera letra (ej. casado -> C) si hay único match
  const first = needle[0];
  const byInitial = list.filter((c) => String(c.label).trim().toLowerCase().startsWith(first));
  if (byInitial.length === 1) return byInitial[0].value;

  // no match: devuelve lo mismo
  return input;
}

/** Normaliza un payload de Empleado usando los choices */
export function coerceEmpleadoPayload(v: any, choices: ChoicesMap): any {
  const clone: any = { ...v };
  clone.genero        = mapChoiceValue("genero",        v.genero,        choices);
  clone.estado_civil  = mapChoiceValue("estado_civil",  v.estado_civil,  choices);
  clone.contrato      = mapChoiceValue("contrato",      v.contrato,      choices);
  clone.jornada       = mapChoiceValue("jornada",       v.jornada,       choices);
  clone.turno         = mapChoiceValue("turno",         v.turno,         choices);
  return clone;
}

