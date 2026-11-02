import { Router } from "express";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import * as profileController from "../controllers/profile.controller";

const router = Router();

router.get("/:username", optionalAuth, profileController.getProfile);
router.post("/:id/follow", authenticateToken, profileController.toggleFollow);
router.get("/:username/activity", optionalAuth, profileController.getUserActivity);

export default router;
