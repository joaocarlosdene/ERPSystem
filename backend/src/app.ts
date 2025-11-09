import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import  authRoutes  from "./modules/auth/authRoutes.js";
import  userRoutes  from "./modules/users/userRoutes.js";
//import { roleRoutes } from "./modules/role/routes/roleRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import  dashboardRoutes  from "./modules/dashboard/dashboardRoutes.js";
//import  validateRoutes  from "./modules/auth/authValidators.js";
import { calendarRoutes } from "./modules/calendar/calendarRoutes.js";
//import { notificationRoutes } from "./modules/notifications/routes/notificationRoutes.js"

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
app.use("/users", userRoutes);
//app.use("/", roleRoutes);
app.use("/auth", authRoutes);
//app.use("/auth", validateRoutes);  // validate /check session
app.use("/dashboard", dashboardRoutes); // protegida
app.use("/calendar", calendarRoutes)
//app.use("/notifications", notificationRoutes)


// Middleware de erros sempre no final
app.use(errorHandler);