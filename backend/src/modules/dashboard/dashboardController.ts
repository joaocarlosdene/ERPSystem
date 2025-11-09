// src/modules/dashboard/dashboardController.ts
import type { Request, Response } from "express";
import { getDashboardData } from "./dashboardService.js";

export async function dashboardController(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (!user) return res.status(401).json({ message: "Usuário não encontrado" });

    const access = await getDashboardData(user.id);

    res.json({ access });
  } catch (error: any) {
    console.error("[ERROR] /dashboard:", error);
    res.status(500).json({ message: "Erro interno ao carregar dashboard." });
  }
}
