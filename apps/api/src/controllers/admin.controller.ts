import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as adminService from "../services/admin.service";
import { prisma } from "../config/database";

export async function getOverview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getAdminOverview();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { role, isActive, search, page, limit } = req.query;
    const result = await adminService.getAdminUsers({
      role: role as any,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { id } = req.params;
    const updated = await adminService.updateAdminUser(req.user.id, id, req.body);
    res.status(200).json({
      success: true,
      message: "Data pengguna berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { id } = req.params;
    await adminService.deleteAdminUser(req.user.id, id);
    res.status(200).json({
      success: true,
      message: "Pengguna berhasil dihapus",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getInstances(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { isVerified, search, page, limit } = req.query;
    const result = await adminService.getAdminInstances({
      isVerified: isVerified !== undefined ? isVerified === "true" : undefined,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;
    const result = await adminService.getAdminAuditLogs(page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getContentFlags(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, page, limit } = req.query;
    const result = await adminService.getAdminContentFlags(
      status as any,
      page ? parseInt(page as string, 10) : 1,
      limit ? parseInt(limit as string, 10) : 20
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function processFlag(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { id } = req.params;
    const { action, notes } = req.body;
    await adminService.processContentFlag(req.user.id, id, action, notes || "");
    res.status(200).json({
      success: true,
      message: "Tindakan moderasi berhasil diterapkan",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getTrendingConfig(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const config = await prisma.systemSetting.findMany();
    res.status(200).json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateTrendingConfig(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const result = await adminService.updateAdminTrendingConfig(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: "Konfigurasi algoritma trending berhasil diperbarui",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function getCategories(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { reports: true },
        },
      },
      orderBy: { name: "asc" },
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, slug, description, color, icon } = req.body;
    const cat = await prisma.category.create({
      data: { name, slug, description, color, icon: icon || "FolderAlert" },
    });
    res.status(201).json({ success: true, data: cat });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const cat = await prisma.category.update({
      where: { id },
      data: req.body,
    });
    res.status(200).json({ success: true, data: cat });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}
