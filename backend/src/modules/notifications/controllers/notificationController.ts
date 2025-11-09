import type { Request, Response } from "express";
import * as notificationService from "../services/notificationService.js";

// GET /notifications
export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const notifications = await notificationService.getNotifications(userId);
    return res.json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao buscar notificações" });
  }
}

// PATCH /notifications/:id/read
export async function markAsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID da notificação é obrigatório" });
    }

    const notification = await notificationService.markNotificationAsRead(id, userId);
    return res.json(notification);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Erro ao marcar notificação como lida" });
  }
}

// POST /notifications
export async function createNotification(req: Request, res: Response) {
  try {
    const { userId, taskId, message } = req.body;

    if (!userId || !taskId || !message) {
      return res.status(400).json({ message: "userId, taskId e message são obrigatórios" });
    }

    const notification = await notificationService.createNotification({ userId, taskId, message });
    return res.status(201).json(notification);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao criar notificação" });
  }
}
