import { Router } from "express";
import { getNotifications, markAsRead, createNotification } from "../controllers/notificationController.js";
import { authenticateToken } from "../../../common/middlewares/authMiddlewear.js";

const notificationRoutes = Router();

// Buscar todas notificações do usuário logado
notificationRoutes.get("/", authenticateToken, getNotifications);

// Marcar uma notificação como lida
notificationRoutes.patch("/:id/read", authenticateToken, markAsRead);

// Criar notificação (normalmente chamada pelo backend quando alguém te adiciona a uma task)
notificationRoutes.post("/", authenticateToken, createNotification);

export {notificationRoutes};
