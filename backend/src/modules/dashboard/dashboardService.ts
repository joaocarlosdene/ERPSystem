// src/modules/dashboard/dashboardService.ts
import prisma from "../../config/lib/prisma.js";

interface DashboardAccess {
  [module: string]: boolean;
}

  // Retorna dados de dashboard com base no usuário
 export async function getDashboardData(userId: string): Promise<DashboardAccess> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  if (!user) throw new Error("Usuário não encontrado");

  const access: DashboardAccess = {};

  // Garante que roles seja sempre array
  const roles = user.roles ?? [];

  roles.forEach((role) => {
    if (role.name === "admin") {
      access["finance"] = true;
      access["sales"] = true;
    } else if (role.name === "user") {
      access["sales"] = true;
    }
  });

  return access;
}

