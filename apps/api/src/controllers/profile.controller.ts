import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as profileService from "../services/profile.service";

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { username } = req.params;
    const profile = await profileService.getProfileByUsername(username, req.user?.id);
    res.status(200).json({ success: true, data: profile });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function toggleFollow(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { id } = req.params;
    const result = await profileService.toggleFollow(req.user.id, id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getUserActivity(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { username } = req.params;
    const tab = (req.query.tab as any) || "posts";
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;

    const result = await profileService.getUserActivity(username, tab, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}
