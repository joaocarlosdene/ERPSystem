import prisma from "../../../config/lib/prisma.js";

/* ==========================================================
   🔹 BUSCAR TODOS OS CALENDÁRIOS DE UM USUÁRIO
   🔹 Inclui as tarefas de cada calendário e os usuários de cada tarefa
   🔹 Ordena por data de criação (mais recente primeiro)
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
   🔹 ownerId = ID do usuário que está criando
   🔹 name = nome do calendário
========================================================== */
export async function createCalendar(ownerId: string, name: string) {
  return prisma.calendar.create({
    data: { name, ownerId },
  });
}

/* ==========================================================
   🔹 CRIAR UMA NOVA TAREFA
   🔹 calendarId = ID do calendário onde a tarefa será criada
   🔹 taskData = dados da tarefa (title, description, date, priority, color, assignedUserIds)
   🔹 assignedUserIds = array de IDs de usuários atribuídos à tarefa
   🔹 Cria registros na tabela Task e também UserTask se houver usuários atribuídos
========================================================== */
export async function createTask(calendarId: string, taskData: any) {
  const { title, description, date, priority, color, assignedUserIds } = taskData;

  const dataToCreate: any = {
    title,
    description,
    date: new Date(date),
    priority,
    color,
    calendarId,
  };

  if (assignedUserIds && Array.isArray(assignedUserIds)) {
    // Cria os relacionamentos na tabela UserTask
    dataToCreate.users = {
      create: assignedUserIds.map((userId: string) => ({ userId })),
    };
  }

  const task = await prisma.task.create({ data: dataToCreate });

  // Retorna a tarefa criada com usuários e calendário incluídos
  return prisma.task.findUnique({
    where: { id: task.id },
    include: { users: { include: { user: true } }, calendar: true },
  });
}

/* ==========================================================
   🔹 ATUALIZAR UMA TAREFA EXISTENTE
   🔹 taskId = ID da tarefa a ser atualizada
   🔹 taskData = campos que serão atualizados
   🔹 Pode atualizar title, description, date, priority, color e usuários atribuídos
   🔹 Atualiza relacionamentos em UserTask se assignedUserIds for fornecido
========================================================== */
export async function updateTask(taskId: string, taskData: any) {
  const { title, description, date, priority, color, assignedUserIds } = taskData;

  const dataToUpdate: any = {};
  if (title !== undefined) dataToUpdate.title = title;
  if (description !== undefined) dataToUpdate.description = description;
  if (date !== undefined) dataToUpdate.date = new Date(date);
  if (priority !== undefined) dataToUpdate.priority = priority;
  if (color !== undefined) dataToUpdate.color = color;
  if (assignedUserIds !== undefined) {
    // Substitui os usuários atribuídos à tarefa (remove os antigos e adiciona os novos)
    dataToUpdate.users = {
      set: assignedUserIds.map((userId: string) => ({ userId })),
    };
  }

  return prisma.task.update({
    where: { id: taskId },
    data: dataToUpdate,
    include: { users: { include: { user: true } }, calendar: true },
  });
}

/* ==========================================================
   🔹 DELETAR UMA TAREFA
   🔹 taskId = ID da tarefa a ser deletada
   🔹 Primeiro deleta todos os relacionamentos na tabela UserTask
   🔹 Depois deleta a tarefa em si
   🔹 Evita erro de foreign key constraint
========================================================== */
export async function deleteTask(taskId: string) {
  // Deleta relacionamentos com usuários
  await prisma.userTask.deleteMany({
    where: { taskId },
  });

  // Deleta a tarefa
  return prisma.task.delete({
    where: { id: taskId },
  });
}

/* ==========================================================
   🔹 BUSCAR TAREFAS DE UM USUÁRIO
   🔹 userId = ID do usuário
   🔹 date = opcional, filtra tarefas apenas para uma data específica
   🔹 Inclui informações da tarefa, usuários atribuídos e calendário
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
