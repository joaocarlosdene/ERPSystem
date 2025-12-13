import api from "@/services/api";

export type Notification = {
  id: string;
  userId: string;
  taskId?: string;
  message: string;
  read: boolean;
  createdAt: string;
};

// =====================
// 🔔 NOTIFICAÇÕES
// =====================

// Buscar todas as notificações do usuário logado
export async function getNotifications(): Promise<Notification[]> {
  const { data } = await api.get("/notifications");
  return data;
}

// Marcar uma notificação como lida
export async function markAsRead(notificationId: string): Promise<void> {
  await api.patch(`/notifications/${notificationId}/read`);
}

// Criar uma notificação manualmente (opcional)
export async function createNotification(
  userId: string,
  message: string,
  taskId?: string
): Promise<Notification> {
  const { data } = await api.post("/notifications", {
    userId,
    message,
    taskId,
  });
  return data.notification;
}
