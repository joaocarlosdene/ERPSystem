// src/services/api.ts
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Configura tokens
export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
}

// Limpa tokens
export function clearAuthTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  delete api.defaults.headers.common["Authorization"];
}

// Interceptor para refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        clearAuthTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data;

        setAuthTokens(accessToken, newRefreshToken);
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
