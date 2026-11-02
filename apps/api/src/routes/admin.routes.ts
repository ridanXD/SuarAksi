import { Router } from "express";
import { Role } from "@prisma/client";
import { TrendingConfigSchema } from "@suaraksi/shared";
import { authenticateToken, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import * as adminController from "../controllers/admin.controller";

const router = Router();

router.use(authenticateToken);
router.use(requireRole(Role.ADMIN));

router.get("/dashboard", adminController.getOverview);
router.get("/users", adminController.getUsers);
router.patch("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.get("/instances", adminController.getInstances);
router.get("/audit-logs", adminController.getAuditLogs);
router.get("/flags", adminController.getContentFlags);
router.post("/flags/:id/process", adminController.processFlag);
router.get("/trending/config", adminController.getTrendingConfig);
router.patch("/trending/config", validateBody(TrendingConfigSchema), adminController.updateTrendingConfig);
router.get("/categories", adminController.getCategories);
router.post("/categories", adminController.createCategory);
router.patch("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

export default router;
