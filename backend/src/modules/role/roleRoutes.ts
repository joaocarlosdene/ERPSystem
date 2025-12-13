// src/modules/roles/roleRoutes.ts
import { Router } from "express";
import * as roleController from "./roleController.js";
import { createRoleSchema, updateRoleSchema, validateBody } from "./roleValidator.js";

const router = Router();

// GET /roles — listar todas as roles
router.get("/", roleController.listRoles);

// POST /roles — criar role com validação
router.post("/", validateBody(createRoleSchema), roleController.createRole);

// PUT /roles/:id — atualizar role com validação
router.put("/:id", validateBody(updateRoleSchema), roleController.updateRole);

// DELETE /roles/:id — deletar role
router.delete("/:id", roleController.deleteRole);

export default router;
