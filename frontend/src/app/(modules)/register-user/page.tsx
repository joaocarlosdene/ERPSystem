"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

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
      setTimeout(() => router.push("/login"), 1500);
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
    <div className="max-w-lg mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Cadastro de Usuário
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome Completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Digite o nome completo"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="email@empresa.com"
          />
        </div>

        {/* Senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        {/* Confirmar Senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirmar Senha
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 ${
              confirmPassword && password !== confirmPassword
                ? "border-red-400 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Repita a senha"
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              As senhas não coincidem.
            </p>
          )}
        </div>

        {/* Roles */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Funções (Roles)
            </label>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs text-blue-600 hover:underline"
            >
              {selectedRoles.length === roles.length
                ? "Limpar Tudo"
                : "Selecionar Tudo"}
            </button>
          </div>

          <div className="flex flex-col space-y-2 max-h-40 overflow-y-auto border border-gray-200 p-2 rounded-md">
            {roles.length === 0 ? (
              <p className="text-sm text-gray-500">Carregando funções...</p>
            ) : (
              roles.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center space-x-2 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleChange(role.id)}
                    className="text-blue-600 rounded focus:ring-blue-500"
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
                    className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full"
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
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">
            Usuário Master (acesso total)
          </label>
        </div>

        {/* Botão */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Salvando..." : "Cadastrar Usuário"}
        </button>
      </form>
    </div>
  );
}
