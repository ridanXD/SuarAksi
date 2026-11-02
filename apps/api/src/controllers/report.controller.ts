import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as reportService from "../services/report.service";

export async function getReports(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const {
      tab,
      categoryId,
      status,
      search,
      location,
      authorId,
      targetInstanceId,
      page,
      limit,
    } = req.query;

    const result = await reportService.getReports({
      tab: tab as any,
      categoryId: categoryId as string,
      status: status as any,
      search: search as string,
      location: location as string,
      authorId: authorId as string,
      targetInstanceId: targetInstanceId as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 15,
      currentUserId: req.user?.id,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getReportById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const report = await reportService.getReportById(id, req.user?.id);
    res.status(200).json({ success: true, data: report });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function createReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const report = await reportService.createReport(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Laporan berhasil dipublikasikan",
      data: report,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { id } = req.params;
    const updated = await reportService.updateReport(id, req.user.id, req.user.role, req.body);
    res.status(200).json({
      success: true,
      message: "Laporan berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { id } = req.params;
    await reportService.deleteReport(id, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: "Laporan berhasil dihapus",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}
