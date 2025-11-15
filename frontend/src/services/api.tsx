// src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  withCredentials: true, // enviar cookies (refresh token)
});

// NOTE: não colocar interceptors de auth aqui — o AuthContext vai controlar refresh globalmente.
// Porém manter este export para uso em calls comuns.
export default api;
