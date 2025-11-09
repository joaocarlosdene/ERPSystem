// src/modules/dashboard/dashboardRoutes.ts
import { Router } from "express";
import { dashboardController } from "./dashboardController.js";
import { authMiddleware } from "../../middlewares/authMiddlewear.js";
import { validateDashboardQuery } from "./dashboardValidator.js";

const router = Router();

// GET /dashboard?pagina=1&limit=10
router.get("/", authMiddleware, validateDashboardQuery, dashboardController);

export default router;
