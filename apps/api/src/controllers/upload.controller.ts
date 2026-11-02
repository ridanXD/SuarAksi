import { Request, Response } from "express";

export function uploadFile(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ success: false, message: "Tidak ada file yang diunggah" });
    return;
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
}

export function uploadMultipleFiles(req: Request, res: Response) {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ success: false, message: "Tidak ada file yang diunggah" });
    return;
  }

  const urls = files.map(
    (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
  );

  res.status(200).json({
    success: true,
    data: {
      urls,
      count: files.length,
    },
  });
}
