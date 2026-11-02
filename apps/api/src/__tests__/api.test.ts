import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../config/database";

const app = createApp();

describe("SuarAksi API End-to-End Test Suite", () => {
  let userToken: string;
  let instanceToken: string;
  let adminToken: string;
  let testCategoryId: string;
  let createdReportId: string;

  beforeAll(async () => {
    const adminRes = await request(app).post("/api/auth/login").send({
      email: "admin@suaraksi.id",
      password: "Password123!",
    });
    adminToken = adminRes.body.data.token;

    const instanceRes = await request(app).post("/api/auth/login").send({
      email: "binamarga@jakarta.go.id",
      password: "Password123!",
    });
    instanceToken = instanceRes.body.data.token;

    const userRes = await request(app).post("/api/auth/login").send({
      email: "budi.santoso@gmail.com",
      password: "Password123!",
    });
    userToken = userRes.body.data.token;

    const cat = await prisma.category.findFirst();
    testCategoryId = cat!.id;
  });

  afterAll(async () => {
    if (createdReportId) {
      await prisma.report.deleteMany({ where: { id: createdReportId } });
    }
  });

  it("should return health status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("should register a new user successfully", async () => {
    const unique = Date.now();
    const res = await request(app).post("/api/auth/register").send({
      email: `testuser_${unique}@example.com`,
      username: `testuser_${unique}`,
      name: "Pengguna Uji Coba",
      password: "Password123!",
      role: "USER",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(`testuser_${unique}@example.com`);
  });

  it("should prevent duplicate registration with same email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "admin@suaraksi.id",
      username: "duplicate_admin",
      name: "Duplikat Admin",
      password: "Password123!",
      role: "USER",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should enforce RBAC: normal user cannot access admin endpoints", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should allow admin to access admin dashboard", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalReports).toBeDefined();
  });

  it("should allow authenticated user to create a new report", async () => {
    const res = await request(app)
      .post("/api/reports")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Trotoar Rusak dan Membahayakan Pejalan Kaki di Depan Halte",
        description: "Ubin pemandu tuna netra pecah dan terangkat di sepanjang 20 meter trotoar jalan utama.",
        categoryId: testCategoryId,
        address: "Jl. Gatot Subroto No.10, Jakarta Selatan",
        latitude: -6.2304,
        longitude: 106.8188,
        mediaUrls: ["https://images.unsplash.com/photo-1541888946425-d0fbb1861564?w=800"],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe("SUBMITTED");

    createdReportId = res.body.data.id;
  });

  it("should toggle like and ensure single active like per user", async () => {
    const likeRes1 = await request(app)
      .post(`/api/reports/${createdReportId}/like`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(likeRes1.status).toBe(200);
    expect(likeRes1.body.data.hasLiked).toBe(true);
    expect(likeRes1.body.data.likesCount).toBe(1);

    const likeRes2 = await request(app)
      .post(`/api/reports/${createdReportId}/like`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(likeRes2.status).toBe(200);
    expect(likeRes2.body.data.hasLiked).toBe(false);
    expect(likeRes2.body.data.likesCount).toBe(0);
  });

  it("should toggle UP vote and update upCount", async () => {
    const upRes1 = await request(app)
      .post(`/api/reports/${createdReportId}/up`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(upRes1.status).toBe(200);
    expect(upRes1.body.data.hasUpvoted).toBe(true);
    expect(upRes1.body.data.upsCount).toBe(1);

    const upRes2 = await request(app)
      .post(`/api/reports/${createdReportId}/up`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(upRes2.status).toBe(200);
    expect(upRes2.body.data.hasUpvoted).toBe(false);
    expect(upRes2.body.data.upsCount).toBe(0);
  });

  it("should allow user to comment and create reply", async () => {
    const commentRes = await request(app)
      .post(`/api/reports/${createdReportId}/comments`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        content: "Kondisi ini sangat darurat, mohon pihak berwenang segera memperbaiki.",
      });

    expect(commentRes.status).toBe(201);
    expect(commentRes.body.data.id).toBeDefined();
    const commentId = commentRes.body.data.id;

    const replyRes = await request(app)
      .post(`/api/reports/${createdReportId}/comments`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        content: "Setuju, kemarin saya melintas hampir tersandung.",
        parentId: commentId,
      });

    expect(replyRes.status).toBe(201);
    expect(replyRes.body.data.parentId).toBe(commentId);
  });

  it("should allow instance to update report status with notes", async () => {
    const statusRes = await request(app)
      .patch(`/api/instance/reports/${createdReportId}/status`)
      .set("Authorization", `Bearer ${instanceToken}`)
      .send({
        status: "IN_PROGRESS",
        notes: "Tim teknis lapangan telah meluncur ke lokasi untuk penanganan cepat.",
        evidenceUrls: ["https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800"],
      });

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.status).toBe("IN_PROGRESS");
  });

  it("should allow instance to publish an official response", async () => {
    const respRes = await request(app)
      .post(`/api/instance/reports/${createdReportId}/response`)
      .set("Authorization", `Bearer ${instanceToken}`)
      .send({
        content: "Dinas Bina Marga DKI Jakarta mengonfirmasi perbaikan ubin trotoar ditargetkan rampung hari ini.",
        attachmentUrls: ["https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800"],
      });

    expect(respRes.status).toBe(201);
    expect(respRes.body.data.content).toBeDefined();
    expect(respRes.body.data.instance.isVerified).toBe(true);
  });

  it("should return trending reports and public stats", async () => {
    const trendRes = await request(app).get("/api/trending");
    expect(trendRes.status).toBe(200);
    expect(Array.isArray(trendRes.body.data)).toBe(true);

    const statsRes = await request(app).get("/api/trending/stats");
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data.totalReports).toBeGreaterThan(0);
  });
});
