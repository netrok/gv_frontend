import api from "../../../lib/api";
import { csvEscape, downloadFile, getList, toTitle, fmtDate } from "../helpers/format";

export async function exportEmpleadosCsv(search: string, puestoMap: Record<string,string>, dptoMap: Record<string,string>) {
  const params: Record<string, any> = { per_page: 1000 };
  if (search) params.search = search;
  const { data } = await api.get("/v1/empleados/", { params });
  const list = getList(data);

  const header = [
    "ID","No.","Nombres","Apellido Paterno","Apellido Materno",
    "Puesto","Departamento","Ingreso","Activo","Email"
  ];
  const lines = list.map((r: any) => {
    const puesto = r?.puesto?.nombre ?? puestoMap[String(r?.puesto_id ?? r?.puesto)] ?? "";
    const dpto   = r?.departamento?.nombre ?? dptoMap[String(r?.departamento_id ?? r?.departamento)] ?? "";
    const fecha  = fmtDate(r?.fecha_ingreso ?? r?.ingreso);
    const activo = r?.activo ? "Activo" : "Inactivo";
    return [
      r?.id ?? "",
      r?.num_empleado ?? "",
      toTitle(r?.nombres ?? r?.nombre ?? ""),
      toTitle(r?.apellido_paterno ?? ""),
      toTitle(r?.apellido_materno ?? ""),
      puesto,
      dpto,
      fecha,
      activo,
      r?.email ?? "",
    ].map(csvEscape).join(",");
  });

  const gen = `Generado: ${new Date().toLocaleString("es-MX")}`;
  const filtro = search ? `Filtro: "${search}"` : "Sin filtro";
  const meta = [
    csvEscape(`CONFIDENCIAL — GV RH`),
    csvEscape("Documento confidencial de GV RH — Uso interno únicamente. No distribuir sin autorización."),
    csvEscape(`${filtro} — ${gen}`),
    ""
  ];

  const csv = [
    ...meta,
    header.map(csvEscape).join(","),
    ...lines
  ].join("\r\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  downloadFile(`empleados_${new Date().toISOString().slice(0,10)}.csv`, blob);
}
