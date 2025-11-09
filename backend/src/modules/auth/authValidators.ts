// src/modules/auth/authValidator.ts
import { z, type ZodType, type ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";

// Validação do body para registro
export const registerSchema: ZodType = z.object({
  name: z.string().min(3, { message: "Nome deve ter ao menos 3 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter ao menos 6 caracteres" }),
  isMaster: z.boolean().optional(),            // Opcional, controle de segurança no service
  roles: z.array(z.string()).optional(),      // Opcional, IDs de roles
});

// Validação do body para login
export const loginSchema: ZodType = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter ao menos 6 caracteres" }),
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
      return res.status(400).json({ message: "Erro de validação", details: errors });
    }

    // Substitui body pelo validado
    req.body = result.data;
    next();
  };
};
