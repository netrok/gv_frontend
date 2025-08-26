import { deepFixMojibake, looksMojibake, latin1StringToUtf8 } from "./lib/utf8";

const _fetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const res = await _fetch(input, init);
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json") && !ct.includes("text/json")) return res;
  try {
    const buf = await res.clone().arrayBuffer();
    let text = new TextDecoder("utf-8").decode(buf);
    if (looksMojibake(text)) {
      text = latin1StringToUtf8(text);
      if (looksMojibake(text)) text = latin1StringToUtf8(text);
    }
    const fixed = deepFixMojibake(JSON.parse(text));
    const headers = new Headers(res.headers);
    headers.set("content-type", "application/json; charset=utf-8");
    return new Response(JSON.stringify(fixed), {
      status: res.status, statusText: res.statusText, headers
    });
  } catch {
    return res;
  }
};
