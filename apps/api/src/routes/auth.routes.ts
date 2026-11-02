import { Router } from "express";
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from "@suaraksi/shared";
import { validateBody } from "../middleware/validate";
import { authenticateToken } from "../middleware/auth";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post("/register", validateBody(RegisterSchema), authController.register);
router.post("/login", validateBody(LoginSchema), authController.login);
router.get("/me", authenticateToken, authController.getMe);
router.patch("/profile", authenticateToken, validateBody(UpdateProfileSchema), authController.updateProfile);

export default router;
