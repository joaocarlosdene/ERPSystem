import prisma from "../../config/lib/prisma.js";

export const getAllRoles = async () => {
  return prisma.role.findMany({
    select: {
      id: true,
      name: true,
      canAccessDashboard: true,
      description: true,
    },
    orderBy: { name: "asc" },
  });
};

export const createRole = async (data: {
  name: string;
  description?: string | null;
  canAccessDashboard?: boolean;
}) => {
  const existingRole = await prisma.role.findUnique({ where: { name: data.name } });
  if (existingRole) throw new Error("Esta role já existe.");

  return prisma.role.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim() ?? null,
      canAccessDashboard: Boolean(data.canAccessDashboard),
    },
  });
};

export const updateRole = async (
  id: string,
  data: { name?: string; description?: string; canAccessDashboard?: boolean }
) => {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new Error("Role não encontrada.");

  return prisma.role.update({
    where: { id },
    data: {
      name: data.name?.trim() ?? role.name,
      description: data.description?.trim() ?? role.description,
      canAccessDashboard:
        typeof data.canAccessDashboard === "boolean"
          ? data.canAccessDashboard
          : role.canAccessDashboard,
    },
  });
};

export const deleteRole = async (id: string) => {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new Error("Role não encontrada.");

  return prisma.role.delete({ where: { id } });
};
