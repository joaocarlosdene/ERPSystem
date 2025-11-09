import { Router } from "express";
import * as calendarController from "./calendarController.js";
import {authMiddleware } from "../../middlewares/authMiddlewear.js";

const calendarRoutes = Router();

// Calendários do usuário
calendarRoutes.get("/", authMiddleware, calendarController.getUserCalendars);

// Criar calendário
calendarRoutes.post("/", authMiddleware, calendarController.createCalendar);

// Criar tarefa
calendarRoutes.post("/:calendarId/task", authMiddleware, calendarController.createTask);

// Atualizar tarefa
calendarRoutes.put("/task/:taskId", authMiddleware, calendarController.updateTask);

// Deletar tarefa
calendarRoutes.delete("/task/:taskId", authMiddleware, calendarController.deleteTask);

// Listar tarefas do usuário (por data opcional)
calendarRoutes.get("/user-tasks", authMiddleware, calendarController.getUserTasks);

export { calendarRoutes };
