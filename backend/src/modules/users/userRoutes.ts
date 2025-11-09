// src/modules/users/userRoutes.ts
import { Router } from "express";
import * as userController from "./userController.js";
import { authMiddleware } from "../../middlewares/authMiddlewear.js";
import { createUserSchema, updateUserSchema, validateBody } from "./userValidator.js";

const router = Router();

// Todas as rotas são protegidas
//router.use(authMiddleware);

// GET /users — listar todos os usuários
router.get("/", userController.getUsers);

// Rota para pegar usuário logado
router.get("/me", authMiddleware, userController.getMe);

// POST /users — criar usuário com validação
router.post("/", validateBody(createUserSchema), userController.createUser);

// PUT /users/:id — atualizar usuário com validação
router.put("/:id", validateBody(updateUserSchema), userController.updateUser);

// DELETE /users/:id — deletar usuário
router.delete("/:id", userController.deleteUser);

export default router;
