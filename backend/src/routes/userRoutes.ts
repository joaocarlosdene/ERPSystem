import type { Request, Response, NextFunction, } from "express";
import  express  from "express";
//import { Router } from "express";
import prisma  from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const userRoutes = express.Router();

userRoutes.get("/users", async (req:Request, res:Response, next:NextFunction) => {
  try {
    //return res.send('Hello World')
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    next(error); // passa o erro para o middleware global
  }
});
// Criar novo usuário
userRoutes.post("/users", async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // Verificações básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email e password são obrigatórios.",
      });
    }

    // Verifica se o e-mail já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Este e-mail já está registrado.",
      });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});




export {userRoutes} ;
