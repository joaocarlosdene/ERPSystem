import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3333",
    withCredentials: true, // 🔥 permite envio/recebimento de cookies
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se token expirou → tenta renovar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh"); // backend gera novo accessToken
        return api(originalRequest);
      } catch (err) {
        console.error("Sessão expirada, redirecionando para login...");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api; 