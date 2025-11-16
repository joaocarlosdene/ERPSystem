"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";




// Tipagem aprimorada
interface SubItem {
  label: string;
  path: string;
}

interface MenuItem {
  title: string;
  path?: string;
  subItems?: SubItem[];
}

const menu: MenuItem[] = [
  { title: "Dashboard", path: "/dashboard" },
  {
    title: "ERP",
    subItems: [
      { label: "Compras", path: "erp/compras" },
      { label: "Estoque", path: "erp/estoque" },
      { label: "Vendas", path: "erp/vendas" },
      { label: "Faturamento", path: "/erp/Faturamento" }
    ]
  },
  {
    title: "MRP",
    subItems: [
      { label: "Planejamento", path: "/mrp/planejamento" },
      { label: "Producao", path: "/mrp/producao" },
      { label: "Materiais", path: "/mrp/materiais" },
    ]
  },
  {
    title: "Financeiro",
    subItems: [
      { label: "Contas a Pagar", path: "/financeiro/contasapagar" },
      { label: "Contas a Receber", path: "/financeiro/contasareceber" },
      { label: "Fluxo de Caixa", path: "/financeiro/fluxodecaixa" },
    ]
  },
  {
    title: "Departamento Pessoal",
    subItems: [
      { label: "Funcionarios", path: "/dp/funcionarios" },
      { label: "Folha de Pagamentos", path: "/dp/estoque" },
      { label: "Beneficios", path: "/dp/vendas" },
    ]
  },
  {
    title: "CRM",
    subItems: [
      { label: "Clientes", path: "/crm/compras" },
      { label: "Propostas", path: "/crm/estoque" },
      { label: "Pos-Venda", path: "/crm/vendas" },
    ]
  },
  {
    title: "Gestao",
    subItems: [
      { label: "Projetos", path: "/gestao/compras" },
      { label: "Documentos", path: "/gestao/estoque" },
      { label: "Auditorias", path: "/gestao/vendas" },
    ]
  },
  {
    title: "Risco & Previsao",
    subItems: [
      { label: "Simulacao", path: "/rp/compras" },
      { label: "Analise", path: "/rp/estoque" },
      { label: "Relatorios", path: "/rp/vendas" },
    ]
  },
  {
    title: "Comunicacao",
    subItems: [
      { label: "Chat Interno", path: "/comunicacao/compras" },
      { label: "Tarefas", path: "/comunicacao/vendas" },
    ]
  },
  {
    title: "Agenda",
    subItems: [
      { label: "Calendario", path: "/communication/calendar" },
      { label: "Tarefas", path: "/comunicacao/vendas" },
    ]
  },
  {
    title: "Configuracoes",
    subItems: [
      { label: "Usuarios", path: "/settings/users" },
      { label: "Roles", path: "/settings/roles" },
      { label: "Permissoes", path: "/configuracao/permisoes" },
      { label: "Preferencias", path: "/configuracao/preferencias" },
    ]
  },
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 text-xl font-bold text-blue-400 border-b border-gray-800">MySystem</div>
      <nav className="flex-1 overflow-y-auto">
        {menu.map((item) => (
          <div key={item.title} className="border-b border-gray-800">
            <button
              onClick={() => {
                if (item.path) {
                  router.push(item.path); // Navega se tiver path
                } else {
                  setOpen(open === item.title ? null : item.title); // Alterna submenu
                }
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-800 flex justify-between items-center"
            >
              <span>{item.title}</span>
              {item.subItems && (
                <svg
                  className={`w-4 h-4 transform transition-transform ${open === item.title ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            {item.subItems && open === item.title && (
              <div className="bg-gray-950">
                {item.subItems.map((sub) => (
                  <button
                    key={sub.label}
                    onClick={() => router.push(sub.path)} // ✅ Navegação de subitem
                    className="block w-full text-left px-8 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
