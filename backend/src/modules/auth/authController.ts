// src/modules/auth/authController.ts
import type { Request, Response, NextFunction } from "express";
import * as authService from "./authService.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ message: "Usuário criado com sucesso", user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    // Chama o service que valida e retorna tokens + user
    const tokens = await authService.login({ email, password });

    // Retorna resposta padronizada
    return res.status(200).json({
      message: "Login realizado com sucesso",
      user: tokens.user,          // dados do usuário
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err: any) {
    // 🔹 Erro customizado
    if (err.message === "Usuário não encontrado." || err.message === "Senha incorreta.") {
      return res.status(401).json({ message: err.message });
    }

    // 🔹 Erro inesperado
    console.error("[LOGIN ERROR]:", err);
    return res.status(500).json({ message: "Erro interno do servidor." });
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Token não fornecido" });

    const tokens = await authService.refresh(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Token não fornecido" });

    await authService.logout(refreshToken);
    res.json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    next(err);
  }
}

export async function validate(req: Request, res: Response) {
  try {
    const userId = req.body.user?.userId; // 🧠 vem do middleware de autenticação
    const user = await authService.validateUser(userId);
    res.json({ user });
  } catch (err: any) {
    if (err.message === "Token inválido") {
      return res.status(401).json({ message: err.message });
    }
    if (err.message === "Usuário não encontrado") {
      return res.status(404).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: "Erro ao validar usuário" });
  }
}
