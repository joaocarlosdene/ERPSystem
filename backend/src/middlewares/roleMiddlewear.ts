// src/middlewares/roleMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import prisma from "../config/lib/prisma.js";

/**
 * Middleware de autorização baseado em roles ou flag `isMaster`
 */
export function authorize(roles: string[] = []) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).userId;
      if (!userId) return res.status(401).json({ message: "Usuário não autenticado." });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: true },
      });

      if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

      if (user.isMaster) return next(); // 🟢 mestre tem acesso total

      const userRoles = user.roles.map((r) => r.name);
      const hasPermission = roles.some((r) => userRoles.includes(r));

      if (!hasPermission)
        return res.status(403).json({ message: "Permissão negada." });

      next();
    } catch (err) {
      res.status(500).json({ message: "Erro ao validar permissões.", error: err });
    }
  };
}
