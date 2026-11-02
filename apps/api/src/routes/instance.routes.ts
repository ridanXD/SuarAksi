import { Router } from "express";
import { Role } from "@prisma/client";
import { UpdateReportStatusSchema, CreateOfficialResponseSchema } from "@suaraksi/shared";
import { authenticateToken, requireRole } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import * as instanceController from "../controllers/instance.controller";

const router = Router();

router.use(authenticateToken);
router.use(requireRole(Role.INSTANCE, Role.ADMIN));

router.get("/reports", instanceController.getAssignedReports);
router.patch("/reports/:id/status", validateBody(UpdateReportStatusSchema), instanceController.updateReportStatus);
router.post("/reports/:id/response", validateBody(CreateOfficialResponseSchema), instanceController.addOfficialResponse);
router.get("/analytics", instanceController.getAnalytics);

export default router;
