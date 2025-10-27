import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/lib/prisma.js";

/* ==========================================================
   🔐 CONFIGURAÇÕES
========================================================== */
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRATION = "15m"; // 15 minutos
const REFRESH_TOKEN_EXPIRATION_DAYS = 7; // 7 dias

/* ==========================================================
   🔐 TIPAGENS
========================================================== */
interface DecodedUser {
  userId: string; // agora é string (cuid)
  roles: string[];
  isMaster: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

/* ==========================================================
   🔐 GERAÇÃO DE TOKENS
========================================================== */
export async function generateAccessToken(user: {
  id: string;
  roles: string[];
  isMaster: boolean;
}) {
  return jwt.sign(
    {
      userId: user.id,
      roles: user.roles,
      isMaster: user.isMaster,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRATION }
  );
}

export async function generateRefreshToken(userId: string) {
  const token = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRATION_DAYS}d`,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

  await prisma.refreshToken.create({
    data: {
      userId, // string agora
      token,
      expiresAt,
    },
  });

  return token;
}

/* ==========================================================
   🔑 LOGIN
========================================================== */
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (!user) throw new Error("Usuário não encontrado.");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Senha incorreta.");

  const roleNames = user.roles.map((r) => r.name);

  const accessToken = await generateAccessToken({
    id: user.id,
    roles: roleNames,
    isMaster: user.isMaster,
  });

  const refreshToken = await generateRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      roles: roleNames,
      isMaster: user.isMaster,
    },
  };
}

/* ==========================================================
   🔁 REFRESH TOKEN
========================================================== */
export async function refreshAccessToken(refreshToken: string) {
  const savedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!savedToken || savedToken.expiresAt < new Date()) {
    throw new Error("Refresh token inválido ou expirado.");
  }

  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { roles: true },
  });

  if (!user) throw new Error("Usuário não encontrado.");

  const roleNames = user.roles.map((r) => r.name);

  return await generateAccessToken({
    id: user.id,
    roles: roleNames,
    isMaster: user.isMaster,
  });
}

/* ==========================================================
   🚪 LOGOUT
========================================================== */
export async function logoutUser(refreshToken: string) {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

/* ==========================================================
   🧭 MIDDLEWARE DE AUTENTICAÇÃO
========================================================== */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Token inválido ou expirado." });
  }
}

/* ==========================================================
   🧩 VERIFICAÇÃO DE ROLES (PERMISSÕES)
========================================================== */
export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) return res.status(401).json({ message: "Não autenticado." });

    // ✅ Usuário master sempre tem acesso
    const hasPermission = user.isMaster || user.roles.some((r) => allowedRoles.includes(r));

    if (!hasPermission) {
      return res.status(403).json({ message: "Acesso negado." });
    }

    next();
  };
}
