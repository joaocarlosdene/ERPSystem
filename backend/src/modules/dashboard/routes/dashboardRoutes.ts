import { Router, type Request, type Response } from "express";
import { authenticateToken } from "../../../common/middlewares/authMiddlewear.js";
import prisma from "../../../config/lib/prisma.js";

const router = Router();

router.get(
  "/dashboard",
  authenticateToken,
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    try {
      // 🔹 Busca roles válidas diretamente do banco
      const rolesAtivas = await prisma.role.findMany({
        where: { active: true },
        select: { name: true },
      });

      const rolesValidas = rolesAtivas.map((r) => r.name.toLowerCase());
      const userRoles = user.roles.map((r) => r.toLowerCase()); 

      // 🔹 Monta o objeto de acesso
      const dashboardAccess: Record<string, boolean> = {};

      rolesValidas.forEach((role) => {
        dashboardAccess[role] = user.isMaster || userRoles.includes(role);
      });

      // 🔹 Adiciona o campo master
      dashboardAccess.master = user.isMaster;

      return res.status(200).json({
        message: "Dashboard carregado com sucesso.",
        access: dashboardAccess,
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  }
);

export { router as dashboardRoutes };
