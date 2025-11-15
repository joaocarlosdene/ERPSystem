// src/modules/auth/authService.ts
import prisma from "../../config/lib/prisma.js";
import bcrypt from "bcryptjs";
import * as tokenService from "./tokenService.js";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  isMaster?: boolean;
  roles?: string[]; // IDs das roles
}

interface LoginData {
  email: string;
  password: string;
}

/**
 * Normaliza as roles enviadas (IDs) para o formato do Prisma
 */
async function normalizeRoles(roles: string[]) {
  if (!roles || roles.length === 0) return [];

  const dbRoles = await prisma.role.findMany({
    where: {
      OR: roles.map((r) => ({ id: r })),
    },
  });

  if (dbRoles.length === 0) {
    throw new Error("Nenhuma role válida encontrada.");
  }

  return dbRoles.map((r) => ({ id: r.id }));
}

/* =============================
   REGISTER
============================= */
export async function register({ name, email, password, isMaster, roles }: RegisterData) {
  // Verifica se já existe usuário
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("E-mail já cadastrado.");

  const passwordHash = await bcrypt.hash(password, 12);

  // Garante que roles sempre existe, mesmo que vazia
  const roleConnections = roles && roles.length > 0 ? await normalizeRoles(roles) : [];

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      isMaster: isMaster ?? false,
      roles: { connect: roleConnections },
    },
    include: { roles: true },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isMaster: user.isMaster,
    roles: user.roles.map((r) => r.name),
  };
}

/* =============================
   LOGIN
============================= */
export async function login({ email, password }: LoginData) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (!user) throw new Error("Usuário não encontrado.");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Senha incorreta.");

  const tokens = await tokenService.generateTokens(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isMaster: user.isMaster,
      roles: user.roles.map((r) => r.name),
    },
    ...tokens,
  };
}

/* =============================
   REFRESH TOKEN COM ROTAÇÃO
============================= */
export async function refresh(refreshToken: string) {
  const userId = await tokenService.verifyRefreshToken(refreshToken);

  // Rotaciona: invalida o antigo
  await tokenService.revokeRefreshToken(refreshToken);

  // Gera tokens novos
  return await tokenService.generateTokens(userId);
}

/* =============================
   LOGOUT
============================= */
export async function logout(refreshToken: string) {
  await tokenService.revokeRefreshToken(refreshToken);
  return true;
}

/* =============================
   VALIDATE USER
============================= */
export async function validateUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  if (!user) throw new Error("Usuário não encontrado");

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isMaster: user.isMaster,
    roles: user.roles.map((r) => r.name),
  };
}

/* =============================
   UPDATE USER (opcional)
   Caso queira atualizar roles
============================= */
export async function updateUser(id: string, data: Partial<RegisterData> & { password?: string }) {
  const updatedData: any = { ...data };

  if (data.password) {
    updatedData.passwordHash = await bcrypt.hash(data.password, 12);
    delete updatedData.password;
  }

  if (data.roles) {
    updatedData.roles = {
      set: await normalizeRoles(data.roles),
    };
  } else {
    updatedData.roles = { set: [] }; // garante roles obrigatórios
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
    roles: updated.roles.map((r) => r.name),
  };
}
