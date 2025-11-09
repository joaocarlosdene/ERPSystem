// src/modules/auth/tokenService.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../../config/lib/prisma.js";

interface JwtPayload {
  userId: string;
}

export async function generateTokens(userId: string) {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });

  const tokenHash = await bcrypt.hash(refreshToken, 12);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

export async function verifyRefreshToken(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;

    const tokens = await prisma.refreshToken.findMany({
      where: { userId: payload.userId, revoked: false },
    });

    // Verifica se algum hash do banco bate com o token recebido
    const validToken = await Promise.any(
      tokens.map(async (token) => {
        const match = await bcrypt.compare(refreshToken, token.tokenHash);
        return match ? token : null;
      })
    ).catch(() => null);

    if (!validToken) throw new Error("Refresh token inválido ou revogado");

    return payload.userId;
  } catch {
    throw new Error("Refresh token inválido ou expirado");
  }
}

export async function revokeRefreshToken(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;

    const tokens = await prisma.refreshToken.findMany({
      where: { userId: payload.userId },
    });

    for (const token of tokens) {
      const match = await bcrypt.compare(refreshToken, token.tokenHash);
      if (match) {
        await prisma.refreshToken.update({
          where: { id: token.id },
          data: { revoked: true },
        });
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
