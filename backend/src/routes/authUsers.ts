import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { generateAccessToken, generateRefreshToken, refreshAccessToken } from "../middlewares/tokenUsers.js";

 const authRoutes = Router();

/** Login */
authRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Senha incorreta." });

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    isMaster: user.isMaster,
  });

  const refreshToken = await generateRefreshToken(user.id);

  return res.status(200).json({
    message: "Login realizado com sucesso.",
    accessToken,
    refreshToken,
  });
});

/** Renovar Access Token */
authRoutes.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const newAccessToken = await refreshAccessToken(refreshToken);
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ message: "Refresh token inválido ou expirado." });
  }
});


export {authRoutes}