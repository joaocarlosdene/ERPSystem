import prisma from "../../../config/lib/prisma.js";

interface NotificationData {
  userId: string;
  taskId: string;
  message: string;
}

// Buscar notificações de um usuário
export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    include: { 
      task: {
        include: {
          calendar: true,
          users: { include: { user: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Marcar notificação como lida
export async function markNotificationAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    throw new Error("Notificação não encontrada ou não pertence ao usuário");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
    include: { task: true },
  });
}

// Criar notificação individual (opcional, fora do fluxo de tarefas)
export async function createNotification(data: NotificationData) {
  return prisma.notification.create({
    data,
    include: { task: true },
  });
}
