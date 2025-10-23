"use client";
import React, { useState } from "react";

interface MenuItem {
  title: string;
  subItems?: string[];
}

const menu: MenuItem[] = [
  { title: "Dashboard" },
  { title: "ERP", subItems: ["Compras", "Estoque", "Vendas", "Faturamento"] },
  { title: "MRP", subItems: ["Planejamento", "Produção", "Materiais"] },
  { title: "Financeiro", subItems: ["Contas a Pagar", "Contas a Receber", "Fluxo de Caixa"] },
  { title: "RH", subItems: ["Funcionários", "Folha de Pagamento", "Benefícios"] },
  { title: "CRM", subItems: ["Clientes", "Propostas", "Pós-venda"] },
  { title: "Gestão", subItems: ["Projetos", "Documentos", "Auditorias"] },
  { title: "Risco & Previsão", subItems: ["Simulações", "Análises", "Relatórios"] },
  { title: "Comunicação", subItems: ["Chat Interno", "Calendário", "Tarefas"] },
  { title: "Configurações", subItems: ["Usuários", "Permissões", "Preferências"] },
];

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 text-xl font-bold text-blue-400 border-b border-gray-800">MySystem</div>
      <nav className="flex-1 overflow-y-auto">
        {menu.map((item) => (
          <div key={item.title} className="border-b border-gray-800">
            <button
              onClick={() => setOpen(open === item.title ? null : item.title)}
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
                    key={sub}
                    className="block w-full text-left px-8 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    {sub}
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
