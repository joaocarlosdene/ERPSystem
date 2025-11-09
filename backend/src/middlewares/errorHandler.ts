// src/middlewares/errorHandler.ts
import type { Request, Response, NextFunction } from "express";

// Middleware global para capturar erros em toda a aplicação
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("[ERROR]:", err);

  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor.";

  res.status(status).json({ message });
}
