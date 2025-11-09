// src/modules/users/userService.ts
import prisma from "../../config/lib/prisma.js";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  isMaster?: boolean;
  roles?: string[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  isMaster?: boolean;
  roles?: string[];
}

/* =============================
   GET /users — Listar todos os usuários
============================= */
export async function getAll(): Promise<
  Pick<User, "id" | "name" | "email" | "isMaster" | "createdAt">[]
> {
  const users = await prisma.user.findMany({
    include: { roles: { select: { name: true } } },
  });

  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    isMaster: u.isMaster,
    createdAt: u.createdAt,
    roles: u.roles.map(r => r.name),
  }));
}
/* =============================
   GET /me — Pega o usuário logado
============================= */
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      roles: { select: { name: true } },
    },
  });
  return user;
}

/* =============================
   POST /users — Criar novo usuário
============================= */
export async function createUser(data: CreateUserDTO) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("E-mail já cadastrado.");

  const passwordHash = await bcrypt.hash(data.password, 12);

  const userData: any = {
    name: data.name,
    email: data.email,
    passwordHash,
    isMaster: data.isMaster ?? false,
  };

  if (data.roles && data.roles.length > 0) {
    userData.roles = { connect: data.roles.map(id => ({ id })) };
  }

  return prisma.user.create({ data: userData, include: { roles: true } });
}

/* =============================
   PUT /users/:id — Atualizar um usuário
============================= */
export async function updateUser(id: string, data: UpdateUserDTO) {
  const updatedData: any = { ...data };

  if (data.password) {
    updatedData.passwordHash = await bcrypt.hash(data.password, 12);
    delete updatedData.password;
  }

  if (data.roles) {
    updatedData.roles = { set: data.roles.map(id => ({ id })) };
  }

  return prisma.user.update({
    where: { id },
    data: updatedData,
    include: { roles: true },
  });
}


/* =============================
   DELETE /users/:id — Deletar um usuário
============================= */
export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}
