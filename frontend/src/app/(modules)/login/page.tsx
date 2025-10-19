"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext"; // hook do contexto
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth(); // usa login do AuthContext
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔹 Login via AuthContext (aguarda a atualização do estado)
      await login(email, password);

      toast.success("Login realizado com sucesso!");

      // 🔹 Redireciona apenas após o contexto atualizar user
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast.error(
        error.response?.data?.message || "Falha ao fazer login. Verifique suas credenciais."
      );
    } finally {
      setLoading(false);
    }
  };

  // Se já estiver logado, redireciona automaticamente
  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Acesso ao Sistema ERP
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seuemail@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition ${loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          © {new Date().getFullYear()} Sistema ERP Integrado
        </p>
      </div>
    </div>
  );
}
