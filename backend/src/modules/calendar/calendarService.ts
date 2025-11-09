import prisma from "../../config/lib/prisma.js";

interface TaskData {
  title: string;
  description?: string;
  date: string; // string ISO do frontend
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  color: string;
  assignedUserIds?: string[];
}

/* ==========================================================
   🔹 BUSCAR TODOS OS CALENDÁRIOS DE UM USUÁRIO
========================================================== */
export async function findCalendarsByUser(userId: string) {
  return prisma.calendar.findMany({
    where: { ownerId: userId },
    include: {
      tasks: { include: { users: { include: { user: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/* ==========================================================
   🔹 CRIAR UM NOVO CALENDÁRIO
========================================================== */
export async function createCalendar(ownerId: string, name: string) {
  return prisma.calendar.create({
    data: { name, ownerId },
  });
}

/* ==========================================================
   🔹 CRIAR UMA NOVA TAREFA (INDIVIDUAL OU COLABORATIVA + NOTIFICAÇÕES)
========================================================== */
export async function createTask(calendarId: string, taskData: TaskData) {
  const { title, description, date, priority, color, assignedUserIds } = taskData;

  const dataToCreate: any = {
    title,
    description,
    date: new Date(date), // converte ISO string em Date
    priority,
    color,
    calendarId,
  };

  if (assignedUserIds?.length) {
    dataToCreate.users = {
      create: assignedUserIds.map((userId) => ({ userId })),
    };
  }

  const task = await prisma.task.create({
    data: dataToCreate,
    include: { users: { include: { user: true } }, calendar: true },
  });

  // Criar notificações apenas para usuários diferentes do dono
  if (assignedUserIds?.length) {
    const notifications = assignedUserIds.map((userId) => ({
      userId,
      taskId: task.id,
      message: `Você foi adicionado à tarefa "${task.title}"`,
    }));
    // Evitar duplicidade
    await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true,
    });
  }

  return task;
}

/* ==========================================================
   🔹 ATUALIZAR UMA TAREFA (COM COLABORADORES E NOTIFICAÇÕES)
========================================================== */
export async function updateTask(taskId: string, taskData: TaskData) {
  const { title, description, date, priority, color, assignedUserIds } = taskData;

  // Recuperar tarefa existente
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { users: true },
  });
  if (!task) throw new Error("Tarefa não encontrada");

  const oldUserIds = task.users.map((u) => u.userId);
  const newUserIds = assignedUserIds?.filter((id) => !oldUserIds.includes(id)) || [];

  const dataToUpdate: any = {
    title,
    description,
    date: date ? new Date(date) : undefined,
    priority,
    color,
  };

  if (assignedUserIds) {
    dataToUpdate.users = {
      set: assignedUserIds.map((userId) => ({ userId })),
    };
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: dataToUpdate,
    include: { users: { include: { user: true } }, calendar: true },
  });

  // Notificar somente novos usuários adicionados
  if (newUserIds.length) {
    const notifications = newUserIds.map((userId) => ({
      userId,
      taskId,
      message: `Você foi adicionado à tarefa "${updatedTask.title}"`,
    }));
    await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true,
    });
  }

  return updatedTask;
}

/* ==========================================================
   🔹 DELETAR UMA TAREFA
========================================================== */
export async function deleteTask(taskId: string) {
  // Remover relacionamentos e notificações antes
  await prisma.userTask.deleteMany({ where: { taskId } });
  await prisma.notification.deleteMany({ where: { taskId } });

  return prisma.task.delete({ where: { id: taskId } });
}

/* ==========================================================
   🔹 BUSCAR TAREFAS DE UM USUÁRIO (OPCIONAL POR DATA)
========================================================== */
export async function findUserTasks(userId: string, date?: string) {
  const whereClause: any = { users: { some: { userId } } };

  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    whereClause.date = { gte: dayStart, lte: dayEnd };
  }

  return prisma.task.findMany({
    where: whereClause,
    include: { users: { include: { user: true } }, calendar: true },
    orderBy: { date: "asc" },
  });
}
