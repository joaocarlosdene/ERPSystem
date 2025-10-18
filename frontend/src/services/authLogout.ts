
import { api } from "@/services/api";

export async function authLogout() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await api.post("/logout", { refreshToken });
    }
  } catch (err) {
    console.error("Erro ao deslogar:", err);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/"; // Redireciona para login
  }
}
