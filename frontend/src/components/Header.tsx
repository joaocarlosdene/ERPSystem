"use client";
import React, { useEffect, useRef, useState } from "react";

const Header: React.FC = () => {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [status, setStatus] = useState<"online" | "busy" | "offline">("online");

  const fullName = "João Silva";
  const firstName = fullName.split(" ")[0] || fullName;

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const msgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfile(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (msgRef.current && !msgRef.current.contains(target)) {
        setShowMessages(false);
      }
    }
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  const menuItems = [
    { section: "ERP", items: ["Pedidos", "Faturamento", "Clientes"] },
    { section: "Financeiro", items: ["Contas a Pagar", "Contas a Receber", "Relatórios"] },
    { section: "RH", items: ["Funcionários", "Folha de Pagamento", "Benefícios"] },
    { section: "CRM", items: ["Leads", "Oportunidades", "Campanhas"] },
  ];

  const filteredResults = query
    ? menuItems
        .map((menu) => ({
          section: menu.section,
          items: menu.items.filter((i) => i.toLowerCase().includes(query.toLowerCase())),
        }))
        .filter((menu) => menu.items.length > 0)
    : [];

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-gray-950 to-gray-900 border-b border-gray-800 shadow-[0_1px_10px_rgba(0,0,0,0.3)] relative z-10">
      {/* Pesquisa */}
      <div className="relative w-1/3">
        <div className="flex items-center bg-gray-800/70 rounded-lg px-3 py-1 backdrop-blur-sm border border-gray-700/40 hover:border-blue-500/40 transition">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(e.target.value.length > 0);
            }}
            className="ml-2 bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none w-full text-sm"
          />
        </div>

        {/* Resultados */}
        {showResults && (
          <div className="absolute top-12 left-0 w-full bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-lg animate-fade-in max-h-64 overflow-y-auto z-20">
            {filteredResults.length > 0 ? (
              filteredResults.map((menu) => (
                <div key={menu.section} className="px-3 py-2">
                  <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-1">{menu.section}</h3>
                  {menu.items.map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="block px-3 py-1 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 rounded-md transition"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm px-3 py-2">Nenhum resultado encontrado</p>
            )}
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex items-center gap-5 relative">
        {/* Notificações */}
        <div ref={notifRef} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications((s) => !s);
              setShowMessages(false);
              setShowProfile(false);
            }}
            aria-label="Notificações"
            className="hover:text-blue-400 transition"
          >
            <svg className="w-5 h-5 text-gray-300 hover:text-blue-400 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405M19 13V8a7 7 0 00-14 0v5l-1.405 1.405A2.032 2.032 0 003 17h18a2.032 2.032 0 00-.595-1.405z" />
            </svg>
          </button>

          {showNotifications && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-2 w-72 bg-gray-900/95 border border-gray-700/50 rounded-lg shadow-lg animate-fade-in backdrop-blur-md z-30"
            >
              <div className="p-3 border-b border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">Notificações</h4>
              </div>
              <div className="p-3 text-gray-400 text-sm">Nenhuma notificação no momento.</div>
            </div>
          )}
        </div>

        {/* Mensagens */}
        <div ref={msgRef} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMessages((s) => !s);
              setShowNotifications(false);
              setShowProfile(false);
            }}
            aria-label="Mensagens"
            className="hover:text-blue-400 transition"
          >
            <svg className="w-5 h-5 text-gray-300 hover:text-blue-400 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4z" />
            </svg>
          </button>

          {showMessages && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-2 w-72 bg-gray-900/95 border border-gray-700/50 rounded-lg shadow-lg animate-fade-in backdrop-blur-md z-30"
            >
              <div className="p-3 border-b border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">Mensagens</h4>
              </div>
              <div className="p-3 text-gray-400 text-sm">Nenhuma mensagem nova.</div>
            </div>
          )}
        </div>

        {/* Perfil */}
        <div ref={profileRef} className="relative flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowProfile((s) => !s);
              setShowNotifications(false);
              setShowMessages(false);
            }}
            className="flex items-center gap-2 hover:text-blue-400 transition"
          >
            <div className="relative">
              <img
                src="/avatar.png"
                alt="Perfil"
                className="w-5 h-5 rounded-full border border-gray-700/60 hover:border-blue-500/60 transition"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-gray-900 ${
                  status === "online" ? "bg-green-500" : status === "busy" ? "bg-red-500" : "bg-gray-500"
                }`}
              />
            </div>
            <span className="text-sm text-gray-300 font-medium hidden sm:inline">{firstName}</span>
          </button>

          {showProfile && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 border border-gray-700/50 rounded-lg shadow-lg animate-fade-in backdrop-blur-md z-30"
            >
              <div className="p-3 border-b border-gray-800">
                <h4 className="text-sm font-semibold text-gray-200">{fullName}</h4>
              </div>

              {/* Editar perfil */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // ação de editar perfil
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 transition"
              >
                ✏️ Editar Perfil
              </button>

              {/* Status */}
              <div className="border-t border-gray-800 mt-1 pt-1">
                <p className="text-xs text-gray-400 px-4 mb-1">Status</p>
                {[
                  { key: "online", label: "Online", color: "bg-green-500" },
                  { key: "busy", label: "Ocupado", color: "bg-red-500" },
                  { key: "offline", label: "Offline", color: "bg-gray-500" },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatus(s.key as "online" | "busy" | "offline");
                      setShowProfile(false); // ✅ fecha dropdown ao trocar status
                    }}
                    className={`flex items-center gap-2 px-4 py-2 w-full text-sm ${
                      status === s.key ? "text-blue-400" : "text-gray-300"
                    } hover:bg-blue-600/20 hover:text-blue-400 transition`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-800 mt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // logout
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600/20 hover:text-red-500 transition"
                >
                  ⏻ Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
