// src/modules/users/userController.ts
import type { Request, Response, NextFunction } from "express";
import * as userService from "./userService.js";

// =============================
// GET /users — Listar todos os usuários
// =============================
export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};



/* =============================
   GET /users/me — Pegar usuário logado
============================= */
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Usuário não autenticado." });

    const user = await userService.getMe(userId);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    res.json(user);
  } catch (err) {
    next(err);
  }
};


// =============================
// POST /users — Criar usuário
// =============================
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json({
      message: "Usuário criado com sucesso.",
      user: newUser,
    });
  } catch (err) {
    next(err);
  }
};

// =============================
// PUT /users/:id — Atualizar usuário
// =============================
export const updateUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID do usuário é obrigatório." });

    const updatedUser = await userService.updateUser(id, req.body);
    res.json({ message: "Usuário atualizado com sucesso.", user: updatedUser });
  } catch (err) {
    next(err);
  }
};

// =============================
// DELETE /users/:id — Deletar usuário
// =============================
export const deleteUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID do usuário é obrigatório." });

    await userService.deleteUser(id);
    res.json({ message: "Usuário deletado com sucesso." });
  } catch (err) {
    next(err);
  }
};
