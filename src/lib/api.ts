import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL as string; // ej: http://localhost:8000/api

const api = axios.create({ baseURL: API_URL });

function getTokens() {
  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");
  return { access, refresh };
}

api.interceptors.request.use((config) => {
  const { access } = getTokens();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let refreshing = false;
let queue: Array<(t: string) => void> = [];
const onRefreshed = (t: string) => { queue.forEach((cb) => cb(t)); queue = []; };

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original: any = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { refresh } = getTokens();
      if (!refresh) throw error;

      if (refreshing) {
        return new Promise((resolve) => {
          queue.push((t) => { original.headers.Authorization = `Bearer ${t}`; resolve(api(original)); });
        });
      }

      refreshing = true;
      try {
        const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh });
        localStorage.setItem("access_token", data.access);
        refreshing = false;
        onRefreshed(data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (e) {
        refreshing = false;
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
