import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import * as commentService from "../services/comment.service";

export async function getComments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const comments = await commentService.getCommentsByReportId(id);
    res.status(200).json({ success: true, data: comments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { id } = req.params;
    const comment = await commentService.createComment(req.user.id, id, req.body);
    res.status(201).json({
      success: true,
      message: "Komentar berhasil ditambahkan",
      data: comment,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { commentId } = req.params;
    const updated = await commentService.updateComment(commentId, req.user.id, req.body.content);
    res.status(200).json({
      success: true,
      message: "Komentar berhasil diubah",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const { commentId } = req.params;
    await commentService.deleteComment(commentId, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: "Komentar berhasil dihapus",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export async function flagContent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Tidak terautentikasi" });
      return;
    }
    const flag = await commentService.flagContent(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Laporan pelanggaran konten telah diterima untuk dimoderasi",
      data: flag,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}
