// src/features/empleados/export/excel.ts
import api from "../../../lib/api";

export type EmpleadoExportFilters = {
  q?: string;
  departamento_id?: number | string;
  puesto_id?: number | string;
  activo?: boolean | string | number;
};

const XLSX_CT =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// Convierte lo que venga (Blob, ArrayBuffer, TypedArray, ArrayBufferLike, SAB, string) a Blob
function toBlob(data: any, contentTypeHint?: string): Blob {
  // 1) Blob -> tal cual
  if (typeof Blob !== "undefined" && data instanceof Blob) {
    const t = data.type || contentTypeHint || "application/octet-stream";
    return data.type ? data : new Blob([data], { type: t });
  }

  // 2) ArrayBuffer clásico
  if (data instanceof ArrayBuffer) {
    // forzamos a ArrayBufferView para evitar el error de TS con ArrayBufferLike
    const part = new Uint8Array(data) as unknown as BlobPart;
    return new Blob([part], { type: contentTypeHint || XLSX_CT });
  }

  // 3) TypedArray (Uint8Array, etc.)
  if (data && ArrayBuffer.isView(data)) {
    // aseguramos que sea un ArrayBufferView aceptado por Blob
    const view = new Uint8Array(
      (data as ArrayBufferView).buffer as ArrayBuffer
    ) as unknown as BlobPart;
    return new Blob([view], { type: contentTypeHint || XLSX_CT });
  }

  // 4) ArrayBufferLike o SharedArrayBuffer (tipos raros en algunos adapters)
  if (data && typeof (data as any).byteLength === "number") {
    // Creamos un Uint8Array a partir del buffer “like”
    // Usamos "as any" para esquivar incompatibilidades de definición en TS
    const view = new Uint8Array(data as any) as unknown as BlobPart;
    return new Blob([view], { type: contentTypeHint || XLSX_CT });
  }

  // 5) String => error explícito (probablemente HTML/JSON de error)
  if (typeof data === "string") {
    throw new Error(
      `La API envió texto en lugar de binario:\n${data.slice(0, 1000)}`
    );
  }

  throw new Error("No pude convertir la respuesta a Blob.");
}

// Lee ArrayBuffer desde Blob de forma compatible (por si no existe blob.arrayBuffer)
function blobToArrayBufferSafe(blob: Blob): Promise<ArrayBuffer> {
  const anyBlob = blob as any;
  if (typeof anyBlob.arrayBuffer === "function") {
    return anyBlob.arrayBuffer();
  }
  if (typeof Response !== "undefined") {
    try {
      return new Response(blob).arrayBuffer();
    } catch {
      /* noop */
    }
  }
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as ArrayBuffer);
    fr.onerror = reject;
    fr.readAsArrayBuffer(blob);
  });
}

// Validación rápida: tamaño > 0 y firma ZIP "PK"
async function assertLooksXlsx(blob: Blob) {
  if (!blob || blob.size === 0) {
    throw new Error("El archivo recibido está vacío (0 bytes).");
  }
  const ab = await blobToArrayBufferSafe(blob);
  const u8 = new Uint8Array(ab);
  const looksZip = u8.length >= 2 && u8[0] === 0x50 && u8[1] === 0x4b; // P K
  if (!looksZip) {
    try {
      const txt = await new Response(blob).text();
      throw new Error(
        "El archivo descargado no parece un XLSX válido.\n" +
          (txt ? `Respuesta:\n${txt.slice(0, 1000)}` : "(sin texto legible)")
      );
    } catch {
      throw new Error("El archivo descargado no parece un XLSX válido.");
    }
  }
}

export async function fetchEmpleadosXlsx(
  filters: EmpleadoExportFilters = {}
): Promise<Blob> {
  const url = `/v1/empleados/export/excel/`;

  const res = await api.get(url, {
    responseType: "arraybuffer",
    transformResponse: [(x: any) => x], // no tocar el binario
    params: filters,
    headers: { Accept: "*/*" },
    // withCredentials: true, // si usas cookies
  });

  const ctRaw = String(res.headers?.["content-type"] || "");
  const ct = ctRaw.toLowerCase();

  let blob: Blob;
  try {
    blob = toBlob(res.data, ct || XLSX_CT);
  } catch (convErr) {
    // Algunos adapters ponen los bytes en request.response
    const maybeAB = (res as any)?.request?.response;
    blob = toBlob(maybeAB, ct || XLSX_CT);
  }

  if (ct.includes(XLSX_CT)) {
    await assertLooksXlsx(blob);
    return blob;
  }

  // A veces el servidor no marca el CT pero el archivo sí es ZIP válido
  await assertLooksXlsx(blob);
  const ab = await blobToArrayBufferSafe(blob);
  return new Blob([new Uint8Array(ab) as unknown as BlobPart], { type: XLSX_CT });
}

export async function downloadEmpleadosXlsx(
  filters: EmpleadoExportFilters = {},
  filename?: string
): Promise<void> {
  const blob = await fetchEmpleadosXlsx(filters);

  const nav: any = window.navigator;
  const ts = new Date().toISOString().slice(0, 10);
  const safeName = filename || `empleados_${ts}.xlsx`;

  if (nav && typeof nav.msSaveOrOpenBlob === "function") {
    nav.msSaveOrOpenBlob(blob, safeName);
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  // No revocar en el mismo tick para evitar 0 KB
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 2000);
}
