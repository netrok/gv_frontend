export function looksMojibake(s: string) {
  return /Ã.|Â.|\uFFFD|â|âœ|â\x9d/.test(s);
}
export function latin1StringToUtf8(s: string) {
  const bytes = new Uint8Array([...s].map(ch => ch.charCodeAt(0) & 0xFF));
  return new TextDecoder("utf-8").decode(bytes);
}
export function tryFixUtf8(input: string) {
  if (!input) return input;
  let out = input;
  for (let i = 0; i < 2; i++) {
    if (looksMojibake(out)) {
      const once = latin1StringToUtf8(out);
      if (once !== out) out = once; else break;
    } else break;
  }
  return out;
}
export function deepFixMojibake<T = any>(value: T): T {
  if (value == null) return value;
  if (typeof value === "string") return tryFixUtf8(value) as unknown as T;
  if (Array.isArray(value)) return value.map(v => deepFixMojibake(v)) as unknown as T;
  if (typeof value === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) out[k] = deepFixMojibake(v);
    return out;
  }
  return value;
}
