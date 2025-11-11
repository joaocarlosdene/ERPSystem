import { type Request, type Response, type NextFunction } from "express";
import * as calendarService from "./calendarService.js";
import * as calendarValidator from "./calendarValidator.js";

// GET /calendar
export async function getUserCalendars(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const calendars = await calendarService.findCalendarsByUser(userId);
    res.json(calendars);
  } catch (err) {
    next(err);
  }
}

// POST /calendar
export async function createCalendar(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const { name } = req.body;

    calendarValidator.validateCalendarName(name);

    const calendar = await calendarService.createCalendar(userId, name);
    res.status(201).json({ message: "Calendário criado.", calendar });
  } catch (err) {
    next(err);
  }
}

// POST /calendar/:calendarId/task
export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { calendarId } = req.params;
    const userId = (req as any).user?.id;

    if (!calendarId) {
      return res.status(400).json({ message: "ID do calendário é obrigatório." });
    }

    const taskData = { ...req.body, createdById: userId };
    calendarValidator.validateTaskData(taskData);

    const task = await calendarService.createTask(calendarId, taskData);
    res.status(201).json({ message: "Tarefa criada.", task });
  } catch (err) {
    next(err);
  }
}

// PUT /calendar/task/:taskId
export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: "ID da tarefa é obrigatório." });
    }

    const taskData = req.body;
    calendarValidator.validateTaskData(taskData, true); // true = atualização

    const task = await calendarService.updateTask(taskId, taskData);
    res.json({ message: "Tarefa atualizada com sucesso.", task });
  } catch (err) {
    next(err);
  }
}

// DELETE /calendar/task/:taskId
export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: "ID da tarefa é obrigatório." });
    }

    await calendarService.deleteTask(taskId);
    res.json({ message: "Tarefa deletada com sucesso." });
  } catch (err) {
    next(err);
  }
}

// GET /calendar/user-tasks
export async function getUserTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;
    const date = req.query.date as string | undefined;

    const tasks = await calendarService.findUserTasks(userId, date);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}
