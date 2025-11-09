// frontend/app/communication/calendar/api/calendarApi.ts
import api from "@/services/api"; // seu axios configurado com baseURL e withCredentials

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  color: string;
  date: string; // YYYY-MM-DD
  calendarId: string;
  users?: { user: User }[];
};

export type Calendar = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  tasks: Task[];
};

// =====================
// CALENDÁRIO
// =====================

export async function getUserCalendars(): Promise<Calendar[]> {
  const { data } = await api.get("/calendar");
  return data;
}

export async function createCalendar(name: string): Promise<Calendar> {
  const { data } = await api.post("/calendar", { name });
  return data.calendar;
}

// =====================
// TAREFAS
// =====================

export async function createTask(
  calendarId: string,
  task: Omit<Task, "id" | "calendarId"> & { assignedUserIds?: string[] }
): Promise<Task> {
  const { data } = await api.post(`/calendar/${calendarId}/task`, task);

  // 🔹 Cria notificações apenas para usuários atribuídos e novos
  if (task.assignedUserIds?.length) {
    const notifications = task.assignedUserIds.map((userId) => ({
      userId,
      taskId: data.id,
      message: `Você foi adicionado à tarefa: ${data.title}`,
    }));
    await Promise.all(notifications.map((n) => api.post("/notifications", n)));
  }

  return data;
}

export async function updateTask(
  taskId: string,
  task: Partial<Omit<Task, "id" | "calendarId">> & { assignedUserIds?: string[] }
): Promise<Task> {
  const { data } = await api.put(`/calendar/task/${taskId}`, task);

  // 🔹 Cria notificações para novos usuários atribuídos
  if (task.assignedUserIds?.length) {
    const notifications = task.assignedUserIds.map((userId) => ({
      userId,
      taskId: data.id,
      message: `Você foi adicionado à tarefa: ${data.title}`,
    }));
    await Promise.all(notifications.map((n) => api.post("/notifications", n)));
  }

  return data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/calendar/task/${taskId}`);
}

// Buscar tarefas do usuário logado, opcional por data
export async function getUserTasks(date?: string): Promise<Task[]> {
  const { data } = await api.get("/calendar/user-tasks", { params: { date } });
  return data;
}
