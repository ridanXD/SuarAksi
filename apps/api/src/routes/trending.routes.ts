import { Router } from "express";
import { optionalAuth } from "../middleware/auth";
import * as trendingController from "../controllers/trending.controller";

const router = Router();

router.get("/hot", optionalAuth, trendingController.getHotReports);
router.get("/", optionalAuth, trendingController.getTrendingReports);
router.get("/most-supported", optionalAuth, trendingController.getMostSupported);
router.get("/most-discussed", optionalAuth, trendingController.getMostDiscussed);
router.get("/popular-categories", optionalAuth, trendingController.getPopularCategories);
router.get("/stats", optionalAuth, trendingController.getPublicStats);

export default router;
