// src/features/empleados/export/pdf.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../../lib/api";
import { BRAND, CONFIDENTIAL, hexToRgb, loadLogoDataUrl } from "./branding";
import { getList, toTitle, fmtDate } from "../helpers/format";

// Watermark (texto)
function drawWatermark(doc: jsPDF, text = "CONFIDENCIAL") {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  // usa la rotación del 5º parámetro (tipado válido)
  doc.setTextColor(220);
  doc.setFontSize(80);
  doc.text(text, pageW / 2, pageH / 2, { align: "center", baseline: "middle" }, 45);
}

// Watermark (logo con opacidad si el build lo soporta)
function drawLogoWatermark(doc: jsPDF, logoDataUrl: string | null, opacity = 0.06) {
  if (!logoDataUrl) return;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const wmW = pageW * 0.5;
  const wmH = wmW * 0.3; // logo horizontal
  const x = (pageW - wmW) / 2;
  const y = (pageH - wmH) / 2;

  // Acceso seguro a API no tipada
  const anyDoc = doc as unknown as {
    GState?: new (opts: { opacity?: number }) => any;
    setGState?: (gs: any) => void;
    addImage: jsPDF["addImage"];
  };

  if (anyDoc.GState && anyDoc.setGState) {
    const gs = new anyDoc.GState({ opacity });
    anyDoc.setGState!(gs);
    anyDoc.addImage(logoDataUrl, "PNG", x, y, wmW, wmH, undefined, "FAST");
    const gs1 = new anyDoc.GState({ opacity: 1 });
    anyDoc.setGState!(gs1);
  } else {
    // Fallback sin opacidad
    doc.addImage(logoDataUrl, "PNG", x, y, wmW, wmH, undefined, "FAST");
  }
}

// Página final de firma
function drawSignaturePage(doc: jsPDF, logoDataUrl: string | null, brandName: string) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 40;

  doc.addPage();

  if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, 26, 120, 36);
  doc.setFontSize(14);
  doc.text(`${brandName}`, pageW - marginX, 42, { align: "right" });
  doc.setFontSize(11);
  doc.text("Cierre de reporte", pageW - marginX, 60, { align: "right" });

  doc.setFontSize(18);
  doc.text("Vo. Bo. y Firma", pageW / 2, 140, { align: "center" });
  doc.setDrawColor(120);
  doc.line(pageW * 0.2, 220, pageW * 0.8, 220);

  const signerName = localStorage.getItem("pdfSignerName") ?? "Nombre del Responsable";
  const signerRole = localStorage.getItem("pdfSignerRole") ?? "Recursos Humanos";
  const today = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "2-digit", day: "2-digit" });

  doc.setFontSize(12);
  doc.text(signerName, pageW / 2, 240, { align: "center" });
  doc.setFontSize(11);
  doc.text(signerRole, pageW / 2, 260, { align: "center" });
  doc.text(`Fecha: ${today}`, pageW / 2, 280, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(CONFIDENTIAL, marginX, pageH - 18, { align: "left" });
  // ✅ usa API pública tipada
  doc.text(`Página ${doc.getNumberOfPages()}`, pageW - marginX, pageH - 18, { align: "right" });
}

export async function exportEmpleadosPdf(
  search: string,
  puestoMap: Record<string, string>,
  dptoMap: Record<string, string>
) {
  const params: Record<string, any> = { per_page: 1000 };
  if (search) params.search = search;
  const { data } = await api.get("/v1/empleados/", { params });
  const list: any[] = getList(data);

  const rows = list.map((r) => {
    const puesto = r?.puesto?.nombre ?? puestoMap[String(r?.puesto_id ?? r?.puesto)] ?? "";
    const dpto = r?.departamento?.nombre ?? dptoMap[String(r?.departamento_id ?? r?.departamento)] ?? "";
    const fecha = fmtDate(r?.fecha_ingreso ?? r?.ingreso);
    const nombre = `${toTitle(r?.nombres ?? r?.nombre ?? "")} ${toTitle(r?.apellido_paterno ?? "")} ${toTitle(r?.apellido_materno ?? "")}`
      .replace(/\s+/g, " ")
      .trim();
    return [r?.num_empleado ?? "", nombre, puesto, dpto, fecha, r?.activo ? "Activo" : "Inactivo", r?.email ?? ""];
  });

  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const [pr, pg, pb] = hexToRgb(BRAND.primary);
  const logoDataUrl = await loadLogoDataUrl();

  // Portada
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, pageW, 160, "F");
  if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, 40, 160, 48);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Listado de Empleados", pageW - marginX, 70, { align: "right", baseline: "middle" });
  doc.setFontSize(12);
  doc.text(BRAND.name, pageW - marginX, 95, { align: "right", baseline: "middle" });

  doc.setTextColor(30);
  doc.setFontSize(16);
  doc.text("Reporte corporativo", pageW / 2, 240, { align: "center" });
  doc.setFontSize(11);
  const gen = `Generado: ${new Date().toLocaleString("es-MX")}`;
  const filtro = search ? `Filtro aplicado: "${search}"` : "Sin filtro aplicado";
  doc.text(gen, pageW / 2, 270, { align: "center" });
  doc.text(filtro, pageW / 2, 290, { align: "center" });

  drawWatermark(doc, "CONFIDENCIAL");
  drawLogoWatermark(doc, logoDataUrl, 0.06);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(CONFIDENTIAL, marginX, pageH - 18, { align: "left" });
  doc.text(`Página 1`, pageW - marginX, pageH - 18, { align: "right" });

  // Tabla
  doc.addPage();
  const headerBarH = 30;
  autoTable(doc, {
    head: [["No.", "Nombre Completo", "Puesto", "Departamento", "Ingreso", "Activo", "Email"]],
    body: rows,
    startY: headerBarH + 16,
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 9, cellPadding: 6, overflow: "linebreak" },
    headStyles: { fillColor: [pr, pg, pb], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    didDrawPage: (data) => {
      const pageW2 = doc.internal.pageSize.getWidth();
      const pageH2 = doc.internal.pageSize.getHeight();

      drawWatermark(doc, "CONFIDENCIAL");
      drawLogoWatermark(doc, logoDataUrl, 0.05);

      // Header barra
      doc.setFillColor(pr, pg, pb);
      doc.rect(0, 0, pageW2, headerBarH, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text("Listado de Empleados", marginX, 19);
      // Filtro
      doc.setFontSize(9);
      doc.text(search ? `Filtro: "${search}"` : "Sin filtro", pageW2 - marginX, 19, { align: "right" });

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(CONFIDENTIAL, marginX, pageH2 - 18, { align: "left" });
      doc.text(`Página ${data.pageNumber + 1}`, pageW2 - marginX, pageH2 - 18, { align: "right" });
    },
  });

  // Firma
  drawSignaturePage(doc, logoDataUrl, BRAND.name);

  // Descargar
  const filename = `empleados_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
