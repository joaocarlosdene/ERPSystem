import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../../config/lib/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
} from "../../../common/middlewares/authMiddlewear.js";

const authRoutes = Router();

/* =============================
   POST /login — Autenticar usuário
============================= */
authRoutes.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    const roleNames = user.roles.map((role) => role.name);

    // 🔹 Gera tokens
    const accessToken = await generateAccessToken({
      id: user.id, // agora é string (ex: cuid)
      roles: roleNames,
      isMaster: user.isMaster,
    });

    const refreshToken = await generateRefreshToken(user.id);

    // 🔹 Define cookies seguros (HTTP-only)
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    // 🔹 Retorna apenas informações seguras do usuário
    return res.status(200).json({
      message: "Login realizado com sucesso.",
      user: {
        id: user.id,
        email: user.email,
        roles: roleNames,
        isMaster: user.isMaster,
      },
      token: accessToken,
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ message: "Erro interno ao efetuar login." });
  }
});

/* =============================
   POST /refresh — Renovar Access Token
============================= */
authRoutes.post("/refresh", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token ausente." });
    }

    const newAccessToken = await refreshAccessToken(refreshToken);

    // Atualiza cookie de accessToken
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    return res.status(200).json({ message: "Token atualizado com sucesso." });
  } catch (err) {
    console.error("Erro ao renovar token:", err);
    return res.status(401).json({ message: "Refresh token inválido ou expirado." });
  }
});

/* =============================
   POST /logout — Encerrar sessão
============================= */
authRoutes.post("/logout", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    // Limpa cookies
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({ message: "Logout realizado com sucesso." });
  } catch (err) {
    console.error("Erro no logout:", err);
    return res.status(500).json({ message: "Erro interno ao efetuar logout." });
  }
});

export { authRoutes };
