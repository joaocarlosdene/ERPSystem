export function validateCalendarName(name: any) {
  if (!name || typeof name !== "string") {
    throw new Error("Nome do calendário inválido.");
  }
}

export function validateTaskData(taskData: any, isUpdate = false) {
  if (!isUpdate) {
    if (!taskData.title || !taskData.date || !taskData.priority) {
      throw new Error("Título, data e prioridade são obrigatórios.");
    }
  }

  if (taskData.title !== undefined && typeof taskData.title !== "string") {
    throw new Error("Título inválido.");
  }

  if (taskData.description !== undefined && typeof taskData.description !== "string") {
    throw new Error("Descrição inválida.");
  }

  if (taskData.date !== undefined && isNaN(new Date(taskData.date).getTime())) {
    throw new Error("Data inválida.");
  }

  if (taskData.priority !== undefined && !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(taskData.priority)) {
    throw new Error("Prioridade inválida.");
  }

  if (taskData.color !== undefined && typeof taskData.color !== "string") {
    throw new Error("Cor inválida.");
  }

  if (taskData.assignedUserIds !== undefined && !Array.isArray(taskData.assignedUserIds)) {
    throw new Error("assignedUserIds deve ser um array.");
  }
}
