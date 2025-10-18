import express, { type Request, type Response, type NextFunction } from "express";
import prisma from "../lib/prisma.js";

const roleRoutes = express.Router();

/* =============================
   GET /roles — Listar todas as roles
============================= */
roleRoutes.get("/roles", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
    res.json(roles);
  } catch (err) {
    next(err);
  }
});

/* =============================
   POST /roles — Criar nova role
============================= */
roleRoutes.post("/roles", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "O nome da role é obrigatório." });

    const existingRole = await prisma.role.findUnique({ where: { name } });
    if (existingRole)
      return res.status(409).json({ message: "Esta role já existe." });

    const newRole = await prisma.role.create({
      data: { name, description },
    });

    return res.status(201).json({
      message: "Role criada com sucesso.",
      role: newRole,
    });
  } catch (err) {
    next(err);
  }
});

/* =============================
   PUT /roles/:id — Atualizar role
============================= */
roleRoutes.put("/roles/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return res.status(404).json({ message: "Role não encontrada." });

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name: name ?? role.name,
        description: description ?? role.description,
      },
    });

    return res.json({
      message: "Role atualizada com sucesso.",
      role: updatedRole,
    });
  } catch (err) {
    next(err);
  }
});

/* =============================
   DELETE /roles/:id — Deletar role
============================= */
roleRoutes.delete("/roles/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) return res.status(404).json({ message: "Role não encontrada." });

    await prisma.role.delete({ where: { id } });

    return res.json({ message: "Role deletada com sucesso." });
  } catch (err) {
    next(err);
  }
});

export { roleRoutes };
