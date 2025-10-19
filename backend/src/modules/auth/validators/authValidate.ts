import type { Request, Response } from "express";
import { Router } from "express";
import { authenticateToken } from "../../../common/middlewares/authMiddlewear.js";

const validateRoutes = Router();

/**
 * GET /validate
 * 
 * Endpoint que valida o token JWT e retorna os dados do usuário.
 * Frontend chama isso ao iniciar a página ou dashboard para saber
 * se o usuário está logado e quais são suas roles.
 */
validateRoutes.get("/validate", authenticateToken, (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Não autenticado." });
  }

  // Retorna somente dados seguros
  return res.status(200).json({
    user: {
      id: req.user.userId,
      roles: req.user.roles,
      isMaster: req.user.isMaster,
    },
  });
});

export { validateRoutes };
