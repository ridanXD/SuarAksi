import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as notificationService from "../services/notification.service";

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await notificationService.getUserNotifications(req.user.id, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { id } = req.params;
    await notificationService.markNotificationAsRead(id, req.user.id);
    res.status(200).json({ success: true, message: "Notifikasi ditandai telah dibaca" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    await notificationService.markAllNotificationsAsRead(req.user.id);
    res.status(200).json({ success: true, message: "Semua notifikasi ditandai telah dibaca" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}
