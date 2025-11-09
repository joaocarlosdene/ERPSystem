// src/modules/auth/authService.ts
import prisma from "../../config/lib/prisma.js";
import bcrypt from "bcryptjs";
import * as tokenService from "./tokenService.js";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  isMaster: boolean;
  roles: string[];
}

interface LoginData {
  email: string;
  password: string;
}

/**
 * Cria um novo usuário no banco.
 * - Gera hash seguro da senha
 * - Conecta roles existentes
 * - Define isMaster somente se passado
 */
export async function register({ name, email, password, isMaster, roles }: RegisterData) {
  // 1️⃣ Verifica se já existe usuário com este e-mail
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("E-mail já cadastrado.");

  // 2️⃣ Criptografa a senha
  const passwordHash = await bcrypt.hash(password, 12);

  // 3️⃣ Monta os dados para criação
  const userData: any = {
    name,
    email,
    passwordHash, // ✅ corresponde ao seu schema atual
    isMaster: isMaster ?? false, // padrão false
  };

  // 4️⃣ Conecta roles se fornecidas
  if (roles && roles.length > 0) {
    userData.roles = {
      connect: roles.map(id => ({ id })), // Prisma precisa deste formato
    };
  }

  // 5️⃣ Cria o usuário no banco
  const user = await prisma.user.create({
    data: userData,
    include: { roles: true }, // retorna roles junto
  });

  // 6️⃣ Retorna apenas dados seguros (sem senha)
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isMaster: user.isMaster,
    roles: user.roles.map(r => r.name),
    createdAt: user.createdAt,
  };
}

export async function login({ email, password }: LoginData) {
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Usuário não encontrado.");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Senha incorreta.");

  const { accessToken, refreshToken } = await tokenService.generateTokens(user.id);

  return { user, accessToken, refreshToken };
}

export async function refresh(refreshToken: string) {
  const userId = await tokenService.verifyRefreshToken(refreshToken);
  return await tokenService.generateTokens(userId);
}

export async function logout(refreshToken: string) {
  return await tokenService.revokeRefreshToken(refreshToken);
}

export async function validateUser(userId: string) {
  if (!userId) throw new Error("Token inválido");

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