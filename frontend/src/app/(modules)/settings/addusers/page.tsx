"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import Layout from "@/components/Layout";

export default function CreateUserPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // ✅ Buscar roles do backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await api.get("/roles");
        setRoles(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
          "Erro ao carregar as funções (roles). Tente novamente."
        );
      }
    };
    fetchRoles();
  }, []);

  // ✅ Alternar seleção de roles
  const handleRoleChange = (id: string) => {
    setSelectedRoles((prev) =>
      prev.includes(id)
        ? prev.filter((r) => r !== id)
        : [...prev, id]
    );
  };

  // ✅ Selecionar / limpar tudo
  const toggleSelectAll = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(roles.map((r) => r.id));
    }
  };

  // ✅ Enviar cadastro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users", {
        name,
        email,
        password,
        isMaster,
        roles: selectedRoles,
      });

      setSuccess("Usuário criado com sucesso!");
      setTimeout(() => router.push("/settings/users"), 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Erro ao criar usuário. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto mt-10 bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-800 text-gray-200">
        <h1 className="text-2xl font-bold text-blue-400 mb-6 text-center">
          Cadastro de Usuário
        </h1>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-400 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900 border border-green-700 text-green-400 px-4 py-2 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Nome Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite o nome completo"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="email@empresa.com"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 bg-gray-800 text-gray-200 ${confirmPassword && password !== confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-700 focus:ring-blue-500"
                }`}
              placeholder="Repita a senha"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                As senhas não coincidem.
              </p>
            )}
          </div>

          {/* Roles */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-200">
                Funções (Roles)
              </label>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs text-blue-400 hover:underline"
              >
                {selectedRoles.length === roles.length
                  ? "Limpar Tudo"
                  : "Selecionar Tudo"}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-700 p-2 rounded-md">
              {roles.length === 0 ? (
                <p className="text-sm text-gray-400">Carregando funções...</p>
              ) : (
                roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center space-x-2 text-sm text-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => handleRoleChange(role.id)}
                      className="text-blue-400 rounded focus:ring-blue-500"
                    />
                    <span>{role.name}</span>
                  </label>
                ))
              )}
            </div>

            {/* Tags das roles selecionadas */}
            {selectedRoles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {roles
                  .filter((r) => selectedRoles.includes(r.id))
                  .map((role) => (
                    <span
                      key={role.id}
                      className="bg-blue-800 text-gray-200 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {role.name}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Checkbox Master */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isMaster}
              onChange={(e) => setIsMaster(e.target.checked)}
              className="w-4 h-4 text-blue-400 border-gray-700 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-gray-200">
              Usuário Master (acesso total)
            </label>
          </div>

          {/* Botões */}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 px-4 rounded-lg text-white font-semibold transition ${loading
                  ? "bg-blue-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
              {loading ? "Salvando..." : "Cadastrar Usuário"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/settings/users")}
              className="flex-1 py-2 px-4 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition"
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </Layout>
  )
}
