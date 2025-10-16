import express, { type Request, type Response, type NextFunction } from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const userRoutes = express.Router();

/* =============================
   GET /users — Listar todos os usuários
============================= */
userRoutes.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

/* =============================
   POST /users — Criar novo usuário
============================= */
userRoutes.post("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, isMaster } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email e password são obrigatórios." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Este e-mail já está registrado." });
    }

    // Conta quantos usuários existem no sistema
    const userCount = await prisma.user.count();

    // Primeiro usuário = Master automático
    const isFirstUser = userCount === 0;
    const finalIsMaster = isFirstUser ? true : Boolean(isMaster);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, isMaster: finalIsMaster },
      select: { id: true, name: true, email: true, isMaster: true, createdAt: true },
    });

    return res.status(201).json({
      message: isFirstUser
        ? "Primeiro usuário criado como Master com sucesso."
        : "Usuário criado com sucesso.",
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
});

/* =============================
   PUT /users/:id — Atualizar um usuário
============================= */
userRoutes.put("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name, email, password } = req.body;

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Atualiza os campos informados
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name ?? user.name,
        email: email ?? user.email,
        password: password ? await bcrypt.hash(password, 10) : user.password,
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
    });

    return res.json({
      message: "Usuário atualizado com sucesso.",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

/* =============================
   DELETE /users/:id — Deletar um usuário
============================= */
userRoutes.delete("/users/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    await prisma.user.delete({ where: { id } });

    return res.json({ message: "Usuário deletado com sucesso." });
  } catch (error) {
    next(error);
  }
});

export { userRoutes };
