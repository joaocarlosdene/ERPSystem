// src/middlewares/rbacMiddleware.ts
import type { Request, Response, NextFunction } from "express";

export function rbacMiddleware(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user)
      return res.status(401).json({ message: "Não autenticado." });

    const userRoles = user.roles.map((r: any) => r.name);
    const hasPermission = requiredRoles.some(role => userRoles.includes(role));

    if (!hasPermission)
      return res.status(403).json({ message: "Permissão negada." });

    next();
  };
}
