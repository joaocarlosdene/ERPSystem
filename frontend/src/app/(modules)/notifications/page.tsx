"use client";

import { useEffect, useState } from "react";
import { getNotifications, markAsRead, type Notification } from "../colaboracao/calendar/api/notificationApi";
import Link from "next/link";
import Layout from "@/components/Layout";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🔹 Buscar notificações do backend
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const data: Notification[] = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error("Erro ao buscar notificações:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  // 🔹 Marcar notificação como lida
  async function handleMarkAsRead(id: string) {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err);
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-4">🔔 Minhas Notificações</h1>

        {loading ? (
          <p className="text-gray-400">Carregando notificações...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500">Nenhuma notificação encontrada.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n: Notification) => (
              <li
                key={n.id}
                className={`p-3 rounded-lg flex justify-between items-center transition ${
                  n.read
                    ? "bg-gray-800 text-gray-400"
                    : "bg-blue-900/40 border border-blue-700 text-gray-100"
                }`}
              >
                <div>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {!n.read && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition"
                  >
                    Marcar como lida
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          <Link
            href="/communication/calendar"
            className="text-blue-400 hover:text-blue-300 text-sm underline transition"
          >
            ← Voltar ao calendário
          </Link>
        </div>
      </div>
    </Layout>
  );
}
