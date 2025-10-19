import { Router, type Request, type Response } from "express";
import { authenticateToken, authorizeRoles } from "../../../common/middlewares/authMiddlewear.js";

const router = Router();

/**
 * GET /dashboard
 * Dashboard principal
 * Apenas usuários autenticados com roles permitidas
 */
router.get(
  "/dashboard",
  authenticateToken, // verifica se o usuário está logado
  authorizeRoles("master", "FINANCEIRO", "gestao", "producao"), // verifica se o usuário tem permissão
  (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    // Inicializa roles como array vazio caso não exista
    const roles = user.roles || [];

    // Personaliza dashboard conforme roles
    const dashboardData: Record<string, boolean> = {
      financeiro: roles.includes("FINANCEIRO") || user.isMaster,
      gestao: roles.includes("gestao") || user.isMaster,
      producao: roles.includes("producao") || user.isMaster,
      rh: roles.includes("rh") || user.isMaster,
      master: user.isMaster,
    };

    return res.status(200).json({
      message: "Dashboard carregado com sucesso.",
      access: dashboardData,
    });
  }
);

export { router as dashboardRoutes };
