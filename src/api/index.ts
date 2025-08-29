import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
  withCredentials: true, // quítalo si no usas cookies
});

// (Opcional) Interceptor simple de errores
api.interceptors.response.use(
  (r) => r,
  (err) => Promise.reject(err)
);
