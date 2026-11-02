import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as instanceService from "../services/instance.service";

export async function getAssignedReports(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { status, page, limit } = req.query;
    const result = await instanceService.getInstanceReports(
      req.user.id,
      status as any,
      page ? parseInt(page as string, 10) : 1,
      limit ? parseInt(limit as string, 10) : 15
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateReportStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { id } = req.params;
    const result = await instanceService.updateReportStatus(id, req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Status laporan berhasil diperbarui",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function addOfficialResponse(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { id } = req.params;
    const result = await instanceService.addOfficialResponse(id, req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Tanggapan resmi berhasil dipublikasikan",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const analytics = await instanceService.getInstanceAnalytics(req.user.id);
    res.status(200).json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}
