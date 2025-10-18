import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
} from "../middlewares/tokenUsers.js";

const authRoutes = Router();

/** -----------------------------
 * Login
 * ----------------------------- */
authRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true }, // pega todas as roles do usuário
    });

    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Senha incorreta." });

    // Extrai nomes das roles
    const roleNames = user.roles.map((role) => role.name);

    // Gera tokens
    const accessToken = await generateAccessToken({
      id: user.id,
      roles: roleNames,
      isMaster: user.isMaster,
    });

    const refreshToken = await generateRefreshToken(user.id);

    return res.status(200).json({
      message: "Login realizado com sucesso.",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        roles: roleNames,
        isMaster: user.isMaster,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao efetuar login." });
  }
});

/** -----------------------------
 * Renovar Access Token
 * ----------------------------- */
authRoutes.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token ausente." });

    const newAccessToken = await refreshAccessToken(refreshToken);

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Refresh token inválido ou expirado." });
  }
});

/** -----------------------------
 * Logout
 * ----------------------------- */
authRoutes.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token ausente." });

    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });

    return res.status(200).json({ message: "Logout realizado com sucesso." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao efetuar logout." });
  }
});

export { authRoutes };
