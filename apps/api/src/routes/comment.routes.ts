import { Router } from "express";
import { FlagContentSchema } from "@suaraksi/shared";
import { authenticateToken } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import * as commentController from "../controllers/comment.controller";

const router = Router();

router.patch("/:commentId", authenticateToken, commentController.updateComment);
router.delete("/:commentId", authenticateToken, commentController.deleteComment);
router.post("/flag", authenticateToken, validateBody(FlagContentSchema), commentController.flagContent);

export default router;
