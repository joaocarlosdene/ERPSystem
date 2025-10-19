import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { authRoutes } from "./modules/auth/routes/authRoutes.js";
import { userRoutes } from "./modules/users/routes/userRoutes.js";
import { roleRoutes } from "./modules/role/routes/roleRoutes.js";
import { errorHandler } from "./common/middlewares/errorHandler.js";
import { dashboardRoutes } from "./modules/dashboard/routes/dashboardRoutes.js";

export const app = express();

dotenv.config();


// Configurações globais
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true, // 🔥 necessário para cookies httpOnly
}));
app.use(express.json());
app.use(cookieParser());

// Rotas
app.use( userRoutes);
app.use("/", authRoutes);
app.use("/", dashboardRoutes); // protegida
app.use("/", roleRoutes);

// Middleware de erros
app.use(errorHandler);