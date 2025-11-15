// src/modules/users/userService.ts
import prisma from "../../config/lib/prisma.js";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  isMaster?: boolean;
  roles?: string[]; // IDs ou nomes
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  isMaster?: boolean;
  roles?: string[]; // IDs ou nomes
}

/* =============================
   GET /users — Listar todos os usuários
============================= */
export async function getAll() {
  const users = await prisma.user.findMany({
    include: {
      roles: { select: { id: true, name: true } },
    },
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
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isMaster: true,
      roles: { select: { id: true, name: true } },
    },
  });
}

/* =============================
   Função auxiliar para mapear roles
============================= */
async function mapRoles(roles?: string[]) {
  if (!roles || roles.length === 0) return undefined;

  const dbRoles = await prisma.role.findMany({
    where: {
      OR: roles.map(r => ({
        id: r,
      })),
    },
  });

  if (dbRoles.length === 0) {
    throw new Error("Nenhuma role informada foi encontrada.");
  }

  return dbRoles.map(r => ({ id: r.id }));
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

  if (data.roles) {
    userData.roles = { connect: await mapRoles(data.roles) };
  }

  const newUser = await prisma.user.create({
    data: userData,
    include: { roles: true },
  });

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    isMaster: newUser.isMaster,
    roles: newUser.roles.map(r => r.name),
  };
}

/* =============================
   PUT /users/:id — Atualizar um usuário
============================= */
export async function updateUser(id: string, data: UpdateUserDTO) {
  const updatedData: any = {};

  if (data.name) updatedData.name = data.name;
  if (data.email) updatedData.email = data.email;
  if (data.isMaster !== undefined) updatedData.isMaster = data.isMaster;

  if (data.password) {
    updatedData.passwordHash = await bcrypt.hash(data.password, 12);
  }

  if (data.roles) {
    updatedData.roles = {
      set: await mapRoles(data.roles),
    };
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updatedData,
    include: { roles: true },
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    isMaster: updated.isMaster,
    roles: updated.roles.map(r => r.name),
  };
}

/* =============================
   DELETE /users/:id — Deletar um usuário
============================= */
export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}
