import express, { type Request, type Response, type NextFunction } from "express";
import prisma from "../../../config/lib/prisma.js";
import bcrypt from "bcryptjs";
import { authenticateToken } from "../../../common/middlewares/authMiddlewear.js";


const userRoutes = express.Router();

/* =============================
   GET /users — Listar todos os usuários
============================= */
userRoutes.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        roles: { select: { name: true } }
      }
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isMaster: u.isMaster,
      createdAt: u.createdAt,
      roles: u.roles.map((r) => r.name),
    }));

    res.json(formattedUsers);
  } catch (error) {
    next(error);
  }
});

/* =============================
   GET /me — Pega o usuario logado
============================= */
userRoutes.get("/me", authenticateToken, async (req: Request, res:Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Usuário não autenticado." });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, roles: true, isMaster: true },
    });

    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    res.json(user);
  } catch (err) {
    console.error("Erro ao buscar usuário logado:", err);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
});

/* =============================
   POST /users — Criar novo usuário
============================= */
userRoutes.post("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, isMaster, roles } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email e password são obrigatórios." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Este e-mail já está registrado." });
    }

    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;
    const finalIsMaster = isFirstUser ? true : Boolean(isMaster);

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData: any = {
      name,
      email,
      password: hashedPassword,
      isMaster: finalIsMaster,
    };

    // Adiciona roles se fornecidas
    if (roles && Array.isArray(roles) && roles.length > 0) {
      userData.roles = {
        connect: roles.map((roleId: string) => ({ id: roleId })),
      };
    }

    const newUser = await prisma.user.create({
      data: userData,
      include: { roles: true },
    });

    return res.status(201).json({
      message: isFirstUser
        ? "Primeiro usuário criado como Master com sucesso."
        : "Usuário criado com sucesso.",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isMaster: newUser.isMaster,
        roles: newUser.roles.map((r) => r.name),
        createdAt: newUser.createdAt,
      },
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
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }

    const { name, email, password, roles, isMaster } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    const updatedData: any = {
      name: name ?? user.name,
      email: email ?? user.email,
      isMaster: isMaster ?? user.isMaster,
      password: password ? await bcrypt.hash(password, 10) : user.password,
    };

    if (roles && Array.isArray(roles)) {
      updatedData.roles = {
        set: roles.map((roleId: string) => ({ id: roleId })),
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData,
      include: { roles: true },
    });

    return res.json({
      message: "Usuário atualizado com sucesso.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isMaster: updatedUser.isMaster,
        roles: updatedUser.roles.map((r) => r.name),
        updatedAt: updatedUser.updatedAt,
      },
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
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

    await prisma.user.delete({ where: { id } });

    return res.json({ message: "Usuário deletado com sucesso." });
  } catch (error) {
    next(error);
  }
});


export { userRoutes };
