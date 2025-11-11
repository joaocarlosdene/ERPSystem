import prisma from "../../config/lib/prisma.js";

interface TaskData {
  title: string;
  description?: string;
  date: string; // ISO string do frontend
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
export async function createTask(
  calendarId: string,
  taskData: TaskData & { createdById?: string }
) {
  const { title, description, date, priority, color, assignedUserIds = [], createdById } = taskData;

  // 🔸 Inclui o criador automaticamente
  const uniqueUserIds = Array.from(
    new Set([...assignedUserIds, createdById].filter(Boolean))
  ) as string[];

  // 🔸 Cria a tarefa com TaskUncheckedCreateInput
  const taskDataToCreate: any = {
    title,
    date: new Date(date),
    priority,
    color,
    calendarId,
  };

  // Inclui optional fields somente se existirem
  if (description) taskDataToCreate.description = description;
  if (createdById) taskDataToCreate.createdById = createdById;

  // Inclui usuários somente se houver
  if (uniqueUserIds.length > 0) {
    taskDataToCreate.users = {
      create: uniqueUserIds.map((userId) => ({ userId })),
    };
  }

  const task = await prisma.task.create({
    data: taskDataToCreate,
    include: {
      users: { include: { user: true } },
      calendar: true,
    },
  });

  // 🔹 Notificações apenas para usuários diferentes do criador
  const notifyUsers = uniqueUserIds.filter((id) => id !== createdById);
  if (notifyUsers.length) {
    await prisma.notification.createMany({
      data: notifyUsers.map((userId) => ({
        userId,
        taskId: task.id,
        message: `Você foi adicionado à tarefa "${task.title}"`,
      })),
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

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { users: true },
  });
  if (!task) throw new Error("Tarefa não encontrada");

  const oldUserIds = task.users.map((u) => u.userId);
  const newUserIds = assignedUserIds?.filter((id) => !oldUserIds.includes(id)) || [];

  const dataToUpdate: any = { title, priority, color };
  if (description) dataToUpdate.description = description;
  if (date) dataToUpdate.date = new Date(date);

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

  if (newUserIds.length) {
    await prisma.notification.createMany({
      data: newUserIds.map((userId) => ({
        userId,
        taskId,
        message: `Você foi adicionado à tarefa "${updatedTask.title}"`,
      })),
      skipDuplicates: true,
    });
  }

  return updatedTask;
}

/* ==========================================================
   🔹 DELETAR UMA TAREFA
========================================================== */
export async function deleteTask(taskId: string) {
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
