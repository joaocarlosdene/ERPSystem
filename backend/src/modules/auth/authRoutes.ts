// src/modules/auth/authRoutes.ts
import { Router } from "express";
import { register, login, refresh, logout } from "./authController.js";
import { validateBody, registerSchema, loginSchema } from "./authValidators.js";
import { authMiddleware } from "../../middlewares/authMiddlewear.js";

const router = Router();

// Registro de usuário
router.post("/register", validateBody(registerSchema), register);

// Login
router.post("/login", validateBody(loginSchema), login);

// Gerar novos tokens
router.post("/refresh", refresh);

// Logout / revogar refresh token
router.post("/logout", logout);



router.get("/validate", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Retorna apenas os dados relevantes
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isMaster: user.isMaster,
        roles: user.roles?.map((r: any) => r.name) ?? [],
      },
    });
  } catch (error) {
    console.error("[ERROR] /auth/validate:", error);
    res.status(500).json({ message: "Erro interno ao validar usuário." });
  }
});

export default router;