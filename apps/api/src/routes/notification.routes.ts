import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import * as notificationController from "../controllers/notification.controller";

const router = Router();

router.use(authenticateToken);

router.get("/", notificationController.getNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

export default router;
