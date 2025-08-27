export const onlyDigits = (s: string) => s.replace(/\D+/g, "");
export const upperAN = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");
export const toTitle = (s?: string) =>
  (s ?? "")
    .toLowerCase()
    .replace(/\b([a-záéíóúñü]+)\b/gi, (w) =>
      /^(de|del|la|las|los|y|o)$/.test(w) ? w : w[0].toUpperCase() + w.slice(1)
    );

export function normalize<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.results) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}
