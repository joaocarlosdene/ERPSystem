"use client";

import React, { useEffect, useState } from "react";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import api from "@/services/api";
import Layout from "@/components/Layout";
import { useRouter } from "next/navigation";

interface Usuario {
  id: number;
  name: string;
  email: string;
  isMaster: boolean;
  roles: string[];
  createdAt: string;
}

const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // estado para busca
  const router = useRouter();

  const fetchUsuarios = async () => {
    try {
      const response = await api.get("/users");
      if (Array.isArray(response.data)) {
        setUsuarios(response.data);
      } else {
        console.error("Formato inesperado:", response.data);
        setError("Formato de dados inesperado da API.");
      }
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      setError("Erro ao buscar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleView = (id: number) => alert(`Visualizar usuário ${id}`);
  const handleEdit = (id: number) => alert(`Editar usuário ${id}`);
  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      try {
        await api.delete(`/users/${id}`);
        alert("Usuário deletado com sucesso!");
        fetchUsuarios();
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao deletar o usuário.");
      }
    }
  };

  // Filtra usuários por nome, email ou roles
const filteredUsuarios = usuarios.filter((user) => {
  const term = searchTerm.toLowerCase();
  const matchNameOrEmail =
    user.name.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term);

  const matchRoles =
    user.roles.some((role) => role.toLowerCase().includes(term));

  return matchNameOrEmail || matchRoles;
});

  return (
    <Layout>
      <div className="p-6 text-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-blue-400">Usuários</h1>
          <button
            onClick={() => router.push("/settings/addusers")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition"
          >
            <Plus size={18} /> Adicionar Usuário
          </button>
        </div>

        {/* Título e campo de busca */}
        <div className="mb-4">
          <h2 className="text-lg font-medium text-gray-300 mb-2">Procurar Usuário</h2>
          <input
            type="text"
            placeholder="Digite nome, email ou role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-900 text-gray-200 border border-gray-700 focus:outline-none focus:border-blue-400"
          />
        </div>

        {loading ? (
          <p className="text-gray-400">Carregando usuários...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : filteredUsuarios.length === 0 ? (
          <p className="text-gray-400">Nenhum usuário encontrado.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-800 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Nome</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Funções</th>
                  <th className="px-4 py-3 text-left">Acesso Master</th>
                  <th className="px-4 py-3 text-left">Cadastrado em</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-800 transition-colors border-t border-gray-800"
                  >
                    <td className="px-4 py-3">{user.id}</td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.roles.length > 0
                        ? user.roles.map((role, index) => (
                            <span key={index}>
                              {role}
                              <br />
                            </span>
                          ))
                        : "Sem função"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {user.isMaster ? (
                        <span className="text-green-400 font-semibold">Sim</span>
                      ) : (
                        <span className="text-gray-400">Não</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 flex justify-center gap-3">
                      <button
                        onClick={() => handleView(user.id)}
                        className="p-2 rounded-md hover:bg-gray-700 text-blue-400"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="p-2 rounded-md hover:bg-gray-700 text-yellow-400"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-md hover:bg-gray-700 text-red-500"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UsuariosPage;
