import type { Request, Response, NextFunction } from "express";
import prisma from "../../config/lib/prisma.js";

/**
 * Middleware dinâmico de autorização
 * Permite acesso apenas a usuários cujas roles estão com `canAccessDashboard = true`
 * ou que sejam `isMaster`.
 */
export async function authorizeDynamicRoles(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Não autenticado." });
    }

    if (user.isMaster) {
      // Master sempre tem acesso
      return next();
    }

    // Busca roles com permissão para o dashboard
    const allowedRoles = await prisma.role.findMany({
      where: { canAccessDashboard: true },
      select: { name: true },
    });

    const allowedNames = allowedRoles.map((r) => r.name);

    // Verifica se o usuário possui alguma dessas roles
    const hasPermission = user.roles.some((r) => allowedNames.includes(r));

    if (!hasPermission) {
      return res.status(403).json({ message: "Acesso negado. Role sem permissão para o dashboard." });
    }

    next();
  } catch (error) {
    console.error("Erro no authorizeDynamicRoles:", error);
    return res.status(500).json({ message: "Erro interno na verificação de roles." });
  }
}
