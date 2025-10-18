import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRATION = "15m";
const REFRESH_TOKEN_EXPIRATION_DAYS = 7;

/** -----------------------------
 * Helper: Gera Access Token
 * ----------------------------- */
export async function generateAccessToken(user: {
  id: number;
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

/** -----------------------------
 * Helper: Gera Refresh Token
 * ----------------------------- */
export async function generateRefreshToken(userId: number) {
  const token = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_EXPIRATION_DAYS}d`,
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

  await prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });

  return token;
}

/** -----------------------------
 * Login: Retorna Access + Refresh Token
 * ----------------------------- */
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true },
  });

  if (!user) throw new Error("Usuário não encontrado");

  // Aqui você deve verificar a senha com bcrypt ou similar
  const isPasswordValid = password === user.password; // substituir por bcrypt.compare
  if (!isPasswordValid) throw new Error("Senha inválida");

  const roleNames = user.roles.map((role) => role.name);

  const accessToken = await generateAccessToken({
    id: user.id,
    roles: roleNames,
    isMaster: user.isMaster,
  });

  const refreshToken = await generateRefreshToken(user.id);

  return { accessToken, refreshToken };
}

/** -----------------------------
 * Refresh: Gera novo Access Token
 * ----------------------------- */
export async function refreshAccessToken(refreshToken: string) {
  const savedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!savedToken || savedToken.expiresAt < new Date()) {
    throw new Error("Refresh token inválido ou expirado");
  }

  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number };

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { roles: true },
  });

  if (!user) throw new Error("Usuário não encontrado");

  const roleNames = user.roles.map((role) => role.name);

  const newAccessToken = await generateAccessToken({
    id: user.id,
    roles: roleNames,
    isMaster: user.isMaster,
  });

  return newAccessToken;
}

/** -----------------------------
 * Logout: Revoga Refresh Token
 * ----------------------------- */
export async function logoutUser(refreshToken: string) {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

/** -----------------------------
 * Verifica se usuário tem determinada role
 * ----------------------------- */
export function hasRole(accessToken: string, requiredRoles: string[]): boolean {
  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET) as { roles: string[] };
    return decoded.roles.some((role) => requiredRoles.includes(role));
  } catch {
    return false;
  }
}
