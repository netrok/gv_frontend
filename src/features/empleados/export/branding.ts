export const BRAND = {
  name: "GV RH",
  primary: "#0B5696",
  lightRow: "#F5F7FA",
};

export const CONFIDENTIAL =
  "Documento confidencial de GV RH — Uso interno únicamente. No distribuir sin autorización.";

export const hexToRgb = (hex: string): [number, number, number] => {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map(c => c + c).join("") : m, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// Carga logo desde /public/logo.png si existe
export async function loadLogoDataUrl(path = "/logo.png"): Promise<string | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
