// src/modules/users/userValidator.ts
import { z, type ZodType, type ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";

// Criação de usuário
export const createUserSchema: ZodType = z.object({
  name: z.string().min(3, { message: "Nome deve ter ao menos 3 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter ao menos 6 caracteres" }),
  isMaster: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
});

// Atualização de usuário
export const updateUserSchema: ZodType = z.object({
  name: z.string().min(3, { message: "Nome deve ter ao menos 3 caracteres" }).optional(),
  email: z.string().email({ message: "E-mail inválido" }).optional(),
  password: z.string().min(6, { message: "Senha deve ter ao menos 6 caracteres" }).optional(),
  isMaster: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
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
