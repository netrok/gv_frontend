// src/lib/api.ts
import axios, { AxiosError, type AxiosHeaders, type AxiosResponse } from "axios";
import {
  deepFixMojibake,
  tryFixUtf8,
  latin1StringToUtf8,
  looksMojibake,
} from "./utf8";

/** VITE_API_URL debe terminar en /api (ej. http://localhost:8000/api) */
const baseURL = (import.meta as any).env?.VITE_API_URL?.toString() || "http://localhost:8000/api";

const defaultHeaders: AxiosHeaders = new (axios.AxiosHeaders as any)({
  Accept: "application/json, text/plain, */*",
  "Accept-Charset": "utf-8",
});

const api = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15000,
  headers: defaultHeaders,
});

api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access_token");
  if (access) {
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${access}`);
  }
  return config;
});

const isLikelyJson = (ct: string) =>
  ct.includes("application/json") || ct.includes("text/json") || ct.includes("+json");
const looksLikeJsonText = (s: string) => /^\s*[\[{"]/.test(s);

api.interceptors.response.use(
  (resp: AxiosResponse) => {
    try {
      const ct = String(resp.headers?.["content-type"] || "").toLowerCase();
      const data = resp.data;

      if (typeof data === "string") {
        let text = data;

        if (isLikelyJson(ct) || looksLikeJsonText(text)) {
          if (looksMojibake(text)) {
            text = latin1StringToUtf8(text);
            if (looksMojibake(text)) text = latin1StringToUtf8(text);
          }
          try {
            resp.data = deepFixMojibake(JSON.parse(text));
          } catch {
            resp.data = tryFixUtf8(text);
          }
        } else {
          resp.data = tryFixUtf8(text);
        }
        return resp;
      }

      if (data && typeof data === "object") {
        resp.data = deepFixMojibake(data);
      }
      return resp;
    } catch {
      return resp;
    }
  },
  (error: AxiosError) => {
    try {
      const ct = String(error?.response?.headers?.["content-type"] || "").toLowerCase();
      let d: any = error?.response?.data;

      if (typeof d === "string") {
        if (looksMojibake(d)) {
          d = latin1StringToUtf8(d);
          if (looksMojibake(d)) d = latin1StringToUtf8(d);
        }
        (error.response as any).data =
          isLikelyJson(ct) || looksLikeJsonText(d)
            ? (() => {
                try { return deepFixMojibake(JSON.parse(d)); }
                catch { return tryFixUtf8(d); }
              })()
            : tryFixUtf8(d);
      } else if (d && typeof d === "object") {
        (error.response as any).data = deepFixMojibake(d);
      }
    } catch { /* ignore */ }
    return Promise.reject(error);
  }
);

export default api;
