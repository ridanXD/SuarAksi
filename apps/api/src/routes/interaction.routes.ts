import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import * as interactionController from "../controllers/interaction.controller";

const router = Router();

router.get("/bookmarks", authenticateToken, interactionController.getBookmarks);

export default router;
