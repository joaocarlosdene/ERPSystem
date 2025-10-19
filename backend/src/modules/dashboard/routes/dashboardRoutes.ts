import { Router, type Request, type Response } from "express";
import { authenticateToken, authorizeRoles } from "../../../common/middlewares/authMiddlewear.js";

const router = Router();

/**
 * GET /dashboard
 * Dashboard principal
 * Apenas usuários autenticados com roles permitidas
 */
router.get(
  "/",
  authenticateToken, // verifica se o usuário está logado
  authorizeRoles("master", "financeiro", "gestao", "producao"), // verifica se o usuário tem permissão
  (req: Request, res: Response) => {
    const user = req.user;

    // Personaliza dashboard conforme roles
    const dashboardData: Record<string, boolean> = {
      financeiro: user?.roles.includes("financeiro") || user?.isMaster || false,
      gestao: user?.roles.includes("gestao") || user?.isMaster || false,
      producao: user?.roles.includes("producao") || user?.isMaster || false,
      rh: user?.roles.includes("rh") || user?.isMaster || false,
      master: user?.isMaster || false,
    };

    res.json({
      message: "Dashboard carregado com sucesso.",
      access: dashboardData,
    });
  }
);

export { router as dashboardRoutes };
