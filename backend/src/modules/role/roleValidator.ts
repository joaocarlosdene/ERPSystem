import { z, type ZodType, type ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";

// Criação de role
export const createRoleSchema: ZodType = z.object({
  name: z.string().min(1, { message: "O nome da role é obrigatório." }),
  description: z.string().optional(),
  canAccessDashboard: z.boolean().optional(),
});

// Atualização de role
export const updateRoleSchema: ZodType = z.object({
  name: z.string().min(1, { message: "O nome da role é obrigatório." }).optional(),
  description: z.string().optional(),
  canAccessDashboard: z.boolean().optional(),
});

// Middleware genérico de validação de body
export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = result.error as ZodError<any>;
      const errors = error.issues.map(issue => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return res.status(400).json({ errors });
    }

    req.body = result.data;
    next();
  };
};
