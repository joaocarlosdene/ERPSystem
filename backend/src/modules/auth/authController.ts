// src/modules/auth/authController.ts
import type { Request, Response, NextFunction } from "express";
import * as authService from "./authService.js";
import type { CookieOptions } from "express";

// =============================
// CONFIGURAÇÃO DO COOKIE
// =============================
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS obrigatório em produção
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
};

// =============================
// REGISTER — Cria novo usuário
// =============================
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: "Usuário criado com sucesso", user });
  } catch (err) {
    next(err);
  }
}

// =============================
// LOGIN — Retorna access token e refresh token em cookie HttpOnly
// =============================
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    const { user, accessToken, refreshToken } = await authService.login({ email, password });

    // Salva refresh token em cookie HttpOnly
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    // Retorna access token e usuário
    res.json({ message: "Login realizado com sucesso", user, accessToken });
  } catch (err: any) {
    if (err.message === "Usuário não encontrado." || err.message === "Senha incorreta.") {
      return res.status(401).json({ message: err.message });
    }
    console.error("[LOGIN ERROR]:", err);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

// =============================
// REFRESH — Retorna novo access token
// =============================
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token não fornecido." });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);

    // Atualiza cookie com novo refresh token
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("[REFRESH ERROR]:", err);
    return res.status(401).json({ message: "Refresh token inválido." });
  }
}

// =============================
// LOGOUT — Invalida refresh token e limpa cookie
// =============================
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    next(err);
  }
}

// =============================
// VALIDATE USER — Retorna dados do usuário logado
// =============================
export async function validate(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id; // req.user populado pelo middleware JWT
    if (!userId) return res.status(401).json({ message: "Token inválido" });

    const user = await authService.validateUser(userId);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
