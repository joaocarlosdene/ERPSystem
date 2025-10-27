"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Layout from "@/components/Layout";

export default function AddRolePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("O nome da função é obrigatório.");
      return;
    }

    try {
      setFormLoading(true);
      await api.post("/roles", { name, description });
      setSuccess("Função criada com sucesso!");
      setName("");
      setDescription("");
      setTimeout(() => router.push("/settings/roles"), 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erro ao criar função.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto text-gray-200">
        <h1 className="text-2xl font-semibold text-blue-400 mb-6 text-center">
          Adicionar Função
        </h1>

        {/* Mensagens de feedback */}
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

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mb-8 bg-gray-800 p-4 rounded-lg border border-gray-700"
        >
          <div>
            <label className="block text-sm font-medium text-gray-200">
              Nome da Função
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Administrador, Supervisor, Operador..."
              className="mt-1 w-full p-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva brevemente o que essa função pode fazer..."
              className="mt-1 w-full p-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={formLoading}
              className={`flex-1 py-2 px-4 rounded-lg text-white font-semibold transition ${
                formLoading
                  ? "bg-blue-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {formLoading ? "Salvando..." : "Criar Função"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/settings/roles")}
              className="flex-1 py-2 px-4 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
