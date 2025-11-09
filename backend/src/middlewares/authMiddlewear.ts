// src/middlewares/authMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/lib/prisma.js";

interface JwtPayload {
  userId: string;
}

// Middleware de autenticação via Bearer Token
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Token de autenticação não encontrado." });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Token inválido." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { roles: true }, // importante para RBAC
    });

    if (!user)
      return res.status(401).json({ message: "Usuário não encontrado." });

    // Anexa o usuário ao objeto da requisição para uso posterior
    (req as any).user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token expirado ou inválido." });
  }
}
