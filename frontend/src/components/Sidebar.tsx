"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  BarChart2,
  Layers,
  Cpu,
  DollarSign,
  Users,
  Shield,
  MessageCircle,
  Calendar,
  Settings,
  Lock,
} from "lucide-react";

// Tipagem aprimorada
interface SubItem {
  label: string;
  path: string;
}

interface MenuItem {
  title: string;
  icon?: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
}

const menu: MenuItem[] = [
  // --- Início ---
  {
    title: "Início",
    icon: <Home />,
    path: "/dashboard",
  },

  // --- Analytics ---
  {
    title: "Analytics",
    icon: <BarChart2 />,
    subItems: [
      { label: "Dashboard Geral", path: "/analytics/dashboard" },
      { label: "Indicadores Operacionais", path: "/analytics/operacional" },
      { label: "Indicadores Financeiros", path: "/analytics/financeiro" },
      { label: "Análise Comercial", path: "/analytics/comercial" },
      { label: "Análise de Produção", path: "/analytics/producao" },
      { label: "Relatórios Personalizados", path: "/analytics/relatorios" },
      { label: "Data Lake / Big Data", path: "/analytics/datalake" },
    ],
  },

  // --- Operações ---
  {
    title: "Operações",
    icon: <Layers />,
    subItems: [
      { label: "Compras", path: "/operacoes/compras" },
      { label: "Estoque", path: "/operacoes/estoque" },
      { label: "Vendas", path: "/operacoes/vendas" },
      { label: "Fiscal", path: "/operacoes/fiscal" },
    ],
  },

  // --- Produção ---
  {
    title: "Produção",
    icon: <Cpu />,
    subItems: [
      { label: "MRP", path: "/producao/mrp" },
      { label: "APS", path: "/producao/aps" },
      { label: "Ordens de Produção", path: "/producao/ordens" },
      { label: "BOM", path: "/producao/bom" },
      { label: "Roteiros", path: "/producao/roteiros" },
      { label: "Chão de Fábrica (MES)", path: "/producao/mes" },
      { label: "Capacidade", path: "/producao/capacidade" },
      { label: "Qualidade", path: "/producao/qualidade" },
    ],
  },

  // --- Financeiro ---
  {
    title: "Financeiro",
    icon: <DollarSign />,
    subItems: [
      { label: "Contabilidade", path: "/financeiro/contabilidade" },
      { label: "Contas a Pagar", path: "/financeiro/contas-pagar" },
      { label: "Contas a Receber", path: "/financeiro/contas-receber" },
      { label: "Caixa / Tesouraria", path: "/financeiro/tesouraria" },
      { label: "Ativos Fixos", path: "/financeiro/ativos" },
      { label: "Fechamento Contábil", path: "/financeiro/fechamento" },
      { label: "Centros de Custo", path: "/financeiro/centros-custo" },
      { label: "Relatórios", path: "/financeiro/relatorios" },
    ],
  },

  // --- CRM ---
  {
    title: "CRM",
    icon: <Users />,
    subItems: [
      { label: "Leads", path: "/crm/leads" },
      { label: "Oportunidades", path: "/crm/oportunidades" },
      { label: "Funil de Vendas", path: "/crm/funil" },
      { label: "Clientes", path: "/crm/clientes" },
      { label: "Atividades / Follow-up", path: "/crm/atividades" },
      { label: "Pós-venda", path: "/crm/pos-venda" },
      { label: "Contratos", path: "/crm/contratos" },
    ],
  },

  // --- Departamento Pessoal ---
  {
    title: "Departamento Pessoal",
    icon: <Users />,
    subItems: [
      { label: "Funcionários", path: "/dp/funcionarios" },
      { label: "Ponto e Frequência", path: "/dp/ponto" },
      { label: "Folha de Pagamento", path: "/dp/folha" },
      { label: "Benefícios", path: "/dp/beneficios" },
      { label: "Treinamentos", path: "/dp/treinamentos" },
      { label: "Segurança e Saúde", path: "/dp/seguranca-saude" },
      { label: "Recrutamento e Seleção", path: "/dp/recrutamento" },
    ],
  },

  // --- Governança ---
  {
    title: "Governança",
    icon: <Shield />,
    subItems: [
      { label: "ESG", path: "/governanca/sustentabilidade/esg" },
      { label: "Energia e Emissões", path: "/governanca/sustentabilidade/emissoes" },
      { label: "Projetos Sustentáveis", path: "/governanca/sustentabilidade/projetos" },
      { label: "Políticas", path: "/governanca/compliance/politicas" },
      { label: "Auditorias Internas", path: "/governanca/compliance/auditorias" },
      { label: "Gestão de Riscos", path: "/governanca/compliance/riscos" },
      { label: "Integridade", path: "/governanca/compliance/integridade" },
      { label: "BSC", path: "/governanca/estrategico/bsc" },
      { label: "OKRs", path: "/governanca/estrategico/okrs" },
      { label: "Planejamento Estratégico", path: "/governanca/estrategico/planejamento" },
      { label: "Projetos Estratégicos", path: "/governanca/estrategico/projetos" },
    ],
  },

  // --- Colaboração ---
  {
    title: "Colaboração",
    icon: <MessageCircle />,
    subItems: [
      { label: "Chat Interno", path: "/colaboracao/chat" },
      { label: "Comunicados", path: "/colaboracao/comunicados" },
      { label: "Grupos e Canais", path: "/colaboracao/grupos" },
      { label: "Editor de Texto", path: "/colaboracao/texteditor" },
      { label: "Calendário", path: "/colaboracao/calendar" },
      { label: "Tarefas", path: "/colaboracao/tarefas" },
      { label: "Agendamentos", path: "/colaboracao/agenda/agendamentos" },
    ],
  },

  // --- Automação & Integrações ---
  {
    title: "Automação & Integrações",
    icon: <Cpu />,
    subItems: [
      { label: "Workflows", path: "/automacao/workflows" },
      { label: "Processos Automatizados", path: "/automacao/processos" },
      { label: "Robôs / Scripts", path: "/automacao/robos" },
      { label: "APIs", path: "/automacao/apis" },
      { label: "EDI / Conectores", path: "/automacao/edi" },
    ],
  },

  // --- Internacionalização ---
  {
    title: "Internacionalização",
    icon: <Layers />,
    subItems: [
      { label: "Multi-idioma", path: "/i18n/idiomas" },
      { label: "Multi-moeda", path: "/i18n/moedas" },
      { label: "Multi-empresa", path: "/i18n/empresas" },
      { label: "Regras por País", path: "/i18n/regras" },
      { label: "Consolidação Global", path: "/i18n/consolidacao" },
    ],
  },

  // --- Configurações ---
  {
    title: "Configurações",
    icon: <Settings />,
    subItems: [
      { label: "Preferências do Usuário", path: "/config/preferencias" },
      { label: "Personalização do Menu", path: "/config/menu" },
      { label: "Temas / Aparência", path: "/config/tema" },
      { label: "Parâmetros Gerais", path: "/config/parametros" },
      { label: "Notificações", path: "/config/notificacoes" },
    ],
  },

  // --- Administração ---
  {
    title: "Administração",
    icon: <Lock />,
    subItems: [
      { label: "Usuários", path: "/admin/users" },
      { label: "Funcoes", path: "/admin/roles" },
      { label: "Permissões", path: "/admin/permissoes" },
      { label: "Perfis", path: "/admin/perfis" },
      { label: "Segurança", path: "/admin/seguranca" },
      { label: "Logs e Auditoria", path: "/admin/logs" },
      { label: "Backups", path: "/admin/backups" },
      { label: "Infraestrutura", path: "/admin/infraestrutura" },
    ],
  },
];

const Sidebar: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 text-xl font-bold text-blue-400 border-b border-gray-800">
        MySystem
      </div>
      <nav className="flex-1 overflow-y-auto">
        {menu.map((item) => (
          <div key={item.title} className="border-b border-gray-800">
            <button
              onClick={() => {
                if (item.path) router.push(item.path);
                else setOpen(open === item.title ? null : item.title);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-800 flex justify-between items-center"
            >
              <span className="flex items-center gap-2">
                {item.icon} <span>{item.title}</span>
              </span>
              {item.subItems && (
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    open === item.title ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
            {item.subItems && open === item.title && (
              <div className="bg-gray-950">
                {item.subItems.map((sub) => (
                  <button
                    key={sub.label}
                    onClick={() => router.push(sub.path)}
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
