import { Router } from "express";
import authRoutes from "./auth.routes";
import reportRoutes from "./report.routes";
import commentRoutes from "./comment.routes";
import interactionRoutes from "./interaction.routes";
import instanceRoutes from "./instance.routes";
import adminRoutes from "./admin.routes";
import profileRoutes from "./profile.routes";
import notificationRoutes from "./notification.routes";
import trendingRoutes from "./trending.routes";
import uploadRoutes from "./upload.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/reports", reportRoutes);
router.use("/comments", commentRoutes);
router.use("/interactions", interactionRoutes);
router.use("/instance", instanceRoutes);
router.use("/admin", adminRoutes);
router.use("/profiles", profileRoutes);
router.use("/notifications", notificationRoutes);
router.use("/trending", trendingRoutes);
router.use("/upload", uploadRoutes);

export default router;
