import { Router } from "express";
import * as calendarController from "../controllers/calendarController.js";
import { authenticateToken } from "../../../common/middlewares/authMiddlewear.js";

const calendarRoutes = Router();

// Calendários do usuário
calendarRoutes.get("/", authenticateToken, calendarController.getUserCalendars);

// Criar calendário
calendarRoutes.post("/", authenticateToken, calendarController.createCalendar);

// Criar tarefa
calendarRoutes.post("/:calendarId/task", authenticateToken, calendarController.createTask);

// Atualizar tarefa
calendarRoutes.put("/task/:taskId", authenticateToken, calendarController.updateTask);

// Deletar tarefa
calendarRoutes.delete("/task/:taskId", authenticateToken, calendarController.deleteTask);

// Listar tarefas do usuário (por data opcional)
calendarRoutes.get("/user-tasks", authenticateToken, calendarController.getUserTasks);

export { calendarRoutes };
