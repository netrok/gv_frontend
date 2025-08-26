import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

type User = { id: number; username: string; email?: string; [k: string]: any };

type AuthValue = {
  user: User | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  debug: { apiUrl: string; mePath?: string; lastError?: string };
};

type JwtPayload = { user_id?: number; sub?: number | string; username?: string; email?: string; [k: string]: any };

const AuthCtx = createContext<AuthValue | null>(null);
const API_URL = import.meta.env.VITE_API_URL as string;

function getAccess() { return localStorage.getItem("access_token") || ""; }

function buildProvisionalUser(access: string): User | null {
  try {
    const payload = jwtDecode<JwtPayload>(access);
    const id = (typeof payload.user_id === "number" ? payload.user_id : undefined) ??
               (typeof payload.sub === "number" ? payload.sub : undefined);
    const username = payload.username ?? "usuario";
    if (id || username) return { id: id ?? 0, username, email: payload.email };
  } catch {}
  return null;
}

async function tryLoginCandidates(username: string, password: string) {
  const candidates = ["/token/", "/auth/jwt/create/", "/v1/token/"];
  const errors: string[] = [];
  for (const path of candidates) {
    try {
      const { data } = await axios.post(`${API_URL}${path}`, { username, password });
      if (data?.access && data?.refresh) return { tokens: data as { access: string; refresh: string }, tokenPath: path };
      errors.push(`POST ${path} sin access/refresh`);
    } catch (e: any) {
      const msg = e?.response?.data?.detail
        ?? (Array.isArray(e?.response?.data?.non_field_errors) ? e.response.data.non_field_errors.join(", ") : undefined)
        ?? e?.response?.statusText ?? e?.message ?? "Error desconocido";
      errors.push(`POST ${path}  ${msg}`);
    }
  }
  throw new Error("No se pudo iniciar sesión:\n" + errors.join("\n"));
}

async function tryMeCandidates() {
  const candidates = ["/me", "/me/", "/v1/me", "/v1/me/", "/auth/users/me/"];
  const errors: string[] = [];
  for (const path of candidates) {
    try {
      const { data } = await api.get(path);
      return { me: data as User, mePath: path };
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? e?.response?.statusText ?? e?.message ?? "Error desconocido";
      errors.push(`GET ${path}  ${msg}`);
    }
  }
  throw new Error("No se pudo obtener /me:\n" + errors.join("\n"));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [debug, setDebug] = useState<{ apiUrl: string; mePath?: string; lastError?: string }>({ apiUrl: API_URL });

  const refreshMe = async () => {
    try {
      const { me, mePath } = await tryMeCandidates();
      setUser(me);
      setDebug((d) => ({ ...d, mePath, lastError: undefined }));
    } catch (e: any) {
      setDebug((d) => ({ ...d, lastError: String(e?.message ?? e) }));
      // mantenemos user provisional si existe
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    const access = getAccess();
    if (access) {
      const provisional = buildProvisionalUser(access);
      if (provisional) setUser(provisional);
      refreshMe();
    } else {
      setReady(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const { tokens } = await tryLoginCandidates(username, password);
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    const provisional = buildProvisionalUser(tokens.access);
    setUser(provisional ?? null);
    setReady(false);
    await refreshMe();
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    window.location.href = "/login";
  };

  const value = useMemo<AuthValue>(
    () => ({ user, ready, isAuthenticated: !!user, login, logout, refreshMe, debug }),
    [user, ready, debug]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
