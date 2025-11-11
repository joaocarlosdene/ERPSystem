import api from "@/services/api";

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
  date: string;
  calendarId: string;
  users?: { user: User }[];
};

export type Calendar = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  tasks?: Task[];
};

// =====================
// CALENDÁRIO
// =====================

export async function getUserCalendars(): Promise<Calendar[]> {
  const { data } = await api.get("/calendar");
  return data; // backend retorna diretamente o array
}

export async function createCalendar(name: string): Promise<Calendar> {
  const { data } = await api.post("/calendar", { name });
  return data.calendar; // backend retorna { message, calendar }
}

// =====================
// TAREFAS
// =====================

export async function createTask(
  calendarId: string,
  task: Omit<Task, "id" | "calendarId"> & { assignedUserIds?: string[] }
): Promise<Task> {
  const { data } = await api.post(`/calendar/${calendarId}/task`, task);
  return data.task; // backend retorna { message, task }
}

export async function updateTask(
  taskId: string,
  task: Partial<Omit<Task, "id" | "calendarId">> & { assignedUserIds?: string[] }
): Promise<Task> {
  const { data } = await api.put(`/calendar/task/${taskId}`, task);
  return data.task; // backend retorna { message, task }
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/calendar/task/${taskId}`);
}

// 🔹 Buscar tarefas do usuário logado, opcionalmente filtradas por data
export async function getUserTasks(date?: string): Promise<Task[]> {
  const { data } = await api.get("/calendar/user-tasks", { params: { date } });
  return data; // backend retorna array direto
}
