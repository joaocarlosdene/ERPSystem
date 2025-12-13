// src/modules/roles/roleController.ts
import type { Request, Response, NextFunction } from "express";
import * as roleService from "./roleService.js";

// =============================
// GET /roles — Listar todas as roles
// =============================
export const listRoles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const roles = await roleService.getAllRoles();
    res.json(roles);
  } catch (err) {
    next(err);
  }
};

// =============================
// POST /roles — Criar role
// =============================
export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newRole = await roleService.createRole(req.body);
    res.status(201).json({
      message: "Role criada com sucesso.",
      role: newRole,
    });
  } catch (err: any) {
    if (err.message === "Esta role já existe.") {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
};

// =============================
// PUT /roles/:id — Atualizar role
// =============================
export const updateRole = async (
  req: Request<{ id: string }>, // Tipagem correta do params
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID da role é obrigatório." });

    const updatedRole = await roleService.updateRole(id, req.body);
    res.json({
      message: "Role atualizada com sucesso.",
      role: updatedRole,
    });
  } catch (err: any) {
    if (err.message === "Role não encontrada.") {
      return res.status(404).json({ message: err.message });
    }
    next(err);
  }
};

// =============================
// DELETE /roles/:id — Deletar role
// =============================
export const deleteRole = async (
  req: Request<{ id: string }>, // Tipagem correta do params
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID da role é obrigatório." });

    await roleService.deleteRole(id);
    res.json({ message: "Role deletada com sucesso." });
  } catch (err: any) {
    if (err.message === "Role não encontrada.") {
      return res.status(404).json({ message: err.message });
    }
    next(err);
  }
};
