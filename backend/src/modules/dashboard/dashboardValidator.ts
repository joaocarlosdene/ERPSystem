// src/modules/dashboard/dashboardValidator.ts
import { z, type ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";

export const dashboardQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, { message: "O parâmetro 'page' deve ser um número válido." })
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, { message: "O parâmetro 'limit' deve ser um número válido." })
    .optional(),
});

export function validateDashboardQuery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const result = dashboardQuerySchema.safeParse(req.query);

  if (!result.success) {
    const error = result.error as ZodError;
    const formattedErrors = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return res.status(400).json({
      message: "Erro de validação nos parâmetros do dashboard.",
      details: formattedErrors,
    });
  }

  Object.assign(req.query, result.data);
  next();
}
