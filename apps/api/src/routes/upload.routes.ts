import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { upload } from "../middleware/upload";
import * as uploadController from "../controllers/upload.controller";

const router = Router();

router.post("/single", authenticateToken, upload.single("file"), uploadController.uploadFile);
router.post("/multiple", authenticateToken, upload.array("files", 5), uploadController.uploadMultipleFiles);

export default router;
