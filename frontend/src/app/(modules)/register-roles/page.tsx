"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Trash2, Edit3, Check, X } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // 🔹 Carrega todas as roles ao montar o componente
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data } = await api.get("/roles");
      setRoles(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Erro ao carregar as funções. Tente novamente."
      );
    }
  };

  // 🔹 Criar nova role
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("O nome da função é obrigatório.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/roles", { name, description });
      setSuccess("Função criada com sucesso!");
      setName("");
      setDescription("");
      fetchRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar a função.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Deletar role
  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta função?")) return;

    try {
      await api.delete(`/roles/${id}`);
      setSuccess("Função excluída com sucesso!");
      fetchRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao excluir a função.");
    }
  };

  // 🔹 Editar role (entrar em modo de edição)
  const startEdit = (role: Role) => {
    setEditingId(role.id);
    setEditName(role.name);
    setEditDescription(role.description);
  };

  // 🔹 Cancelar edição
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  // 🔹 Salvar edição
  const handleUpdate = async (id: string) => {
    if (!editName.trim()) {
      setError("O nome da função é obrigatório.");
      return;
    }

    try {
      await api.put(`/roles/${id}`, {
        name: editName,
        description: editDescription,
      });
      setSuccess("Função atualizada com sucesso!");
      setEditingId(null);
      fetchRoles();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao atualizar a função.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Gerenciar Funções (Roles)
      </h1>

      {/* Feedbacks */}
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

      {/* Formulário de criação */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome da Função
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Administrador, Supervisor, Operador..."
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva brevemente o que essa função pode fazer..."
            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Salvando..." : "Criar Função"}
        </button>
      </form>

      {/* Lista de Roles */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Funções Existentes
      </h2>

      {roles.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma função cadastrada ainda.</p>
      ) : (
        <div className="space-y-2">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex flex-col sm:flex-row justify-between sm:items-center bg-gray-50 border border-gray-200 p-3 rounded-lg hover:bg-gray-100 transition"
            >
              {editingId === role.id ? (
                <div className="flex-1 space-y-2 sm:space-y-0 sm:flex sm:space-x-3 sm:items-center">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full sm:w-2/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleUpdate(role.id)}
                      className="text-green-600 hover:text-green-800"
                      title="Salvar"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-500 hover:text-gray-700"
                      title="Cancelar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center w-full">
                  <div>
                    <p className="font-medium text-gray-800">{role.name}</p>
                    {role.description && (
                      <p className="text-sm text-gray-500">{role.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => startEdit(role)}
                      className="text-blue-500 hover:text-blue-700 transition"
                      title="Editar função"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Excluir função"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
