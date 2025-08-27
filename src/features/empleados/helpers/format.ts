export const toTitle = (s?: string) =>
  (s ?? "")
    .toLowerCase()
    .replace(/\b([a-záéíóúñü]+)\b/gi, (w) =>
      /^(de|del|la|las|los|y|o)$/.test(w) ? w : w[0].toUpperCase() + w.slice(1)
    );

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("es-MX", { year: "numeric", month: "2-digit", day: "2-digit" }) : "";

export const getList = (resp: any) =>
  Array.isArray(resp) ? resp
  : Array.isArray(resp?.data) ? resp.data
  : Array.isArray(resp?.results) ? resp.results
  : [];

export const toMap = (arr: any[], key = "id", label = "nombre") =>
  Object.fromEntries(arr.map((x) => [String(x?.[key]), x?.[label] ?? "—"]));

export const csvEscape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export const downloadFile = (name: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
};
