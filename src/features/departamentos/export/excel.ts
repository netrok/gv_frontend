import api from "../../../lib/api";

const CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function downloadDepartamentosXlsx(params: { q?: string } = {}) {
  const res = await api.get<ArrayBuffer>("/v1/departamentos/export/excel/", {
    params,
    responseType: "arraybuffer",
    headers: { Accept: CT },
  });
  const buf = res.data;
  if (!buf || (buf as ArrayBuffer).byteLength === 0) {
    throw new Error("Archivo XLSX vacío (verifica filtros o permisos).");
  }
  const blob = new Blob([buf], { type: CT });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `departamentos_${new Date().toISOString().slice(0,10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
