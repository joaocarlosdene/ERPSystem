import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRATION = "15m";
const REFRESH_TOKEN_EXPIRATION_DAYS = 7;

/** Gera Access Token (curta duração) */
export function generateAccessToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
}

/** Gera e salva Refresh Token (longa duração) */
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

/** Valida Refresh Token e retorna novo Access Token */
export async function refreshAccessToken(refreshToken: string) {
  const savedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!savedToken || savedToken.expiresAt < new Date()) {
    throw new Error("Refresh token inválido ou expirado");
  }

  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number };

  const newAccessToken = generateAccessToken({ userId: decoded.userId });

  return newAccessToken;
}
