"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit3, Eye, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Layout from "@/components/Layout";

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface Usuario {
  id: string;
  name: string;
  roles: string[];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes] = await Promise.all([
        api.get("/roles"),
        api.get("/users"),
      ]);
      setRoles(rolesRes.data);
      setUsuarios(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta função?")) return;
    try {
      await api.delete(`/roles/${id}`);
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (id: string) => router.push(`/settings/addroles?id=${id}`);
  const handleView = (id: string) => router.push(`/settings/addroles?id=${id}&view=true`);

  return (
    <Layout>
      <div className="p-6 text-gray-200 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-blue-400">Roles</h1>
          <button
            onClick={() => router.push("/settings/addroles")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition"
          >
            <Plus size={18} /> Adicionar Role
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Carregando roles...</p>
        ) : roles.length === 0 ? (
          <p className="text-gray-400">Nenhuma função cadastrada ainda.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-800 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Descrição</th>
                  <th className="px-4 py-3 text-left">Responsáveis</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => {
                  const responsaveis = usuarios.filter((u) => u.roles.includes(role.name));
                  return (
                    <tr key={role.id} className="hover:bg-gray-800 transition-colors border-t border-gray-800">
                      <td className="px-4 py-3">{role.name}</td>
                      <td className="px-4 py-3">{role.description || "—"}</td>
                      <td className="px-4 py-3">
                        {responsaveis.length > 0
                          ? responsaveis.map((u, i) => <span key={i}>{u.name}<br /></span>)
                          : "Sem responsáveis"}
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-3">
                        <button onClick={() => handleView(role.id)} className="p-2 text-blue-400 hover:text-blue-300" title="Visualizar">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleEdit(role.id)} className="p-2 text-yellow-400 hover:text-yellow-300" title="Editar">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(role.id)} className="p-2 text-red-500 hover:text-red-400" title="Deletar">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
