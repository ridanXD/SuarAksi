"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../app");
const database_1 = require("../config/database");
const app = (0, app_1.createApp)();
(0, vitest_1.describe)("SuarAksi API End-to-End Test Suite", () => {
    let userToken;
    let instanceToken;
    let adminToken;
    let testCategoryId;
    let createdReportId;
    (0, vitest_1.beforeAll)(async () => {
        const adminRes = await (0, supertest_1.default)(app).post("/api/auth/login").send({
            email: "admin@suaraksi.id",
            password: "Password123!",
        });
        adminToken = adminRes.body.data.token;
        const instanceRes = await (0, supertest_1.default)(app).post("/api/auth/login").send({
            email: "binamarga@jakarta.go.id",
            password: "Password123!",
        });
        instanceToken = instanceRes.body.data.token;
        const userRes = await (0, supertest_1.default)(app).post("/api/auth/login").send({
            email: "budi.santoso@gmail.com",
            password: "Password123!",
        });
        userToken = userRes.body.data.token;
        const cat = await database_1.prisma.category.findFirst();
        testCategoryId = cat.id;
    });
    (0, vitest_1.afterAll)(async () => {
        if (createdReportId) {
            await database_1.prisma.report.deleteMany({ where: { id: createdReportId } });
        }
    });
    (0, vitest_1.it)("should return health status ok", async () => {
        const res = await (0, supertest_1.default)(app).get("/api/health");
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.status).toBe("ok");
    });
    (0, vitest_1.it)("should register a new user successfully", async () => {
        const unique = Date.now();
        const res = await (0, supertest_1.default)(app).post("/api/auth/register").send({
            email: `testuser_${unique}@example.com`,
            username: `testuser_${unique}`,
            name: "Pengguna Uji Coba",
            password: "Password123!",
            role: "USER",
        });
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.token).toBeDefined();
        (0, vitest_1.expect)(res.body.data.user.email).toBe(`testuser_${unique}@example.com`);
    });
    (0, vitest_1.it)("should prevent duplicate registration with same email", async () => {
        const res = await (0, supertest_1.default)(app).post("/api/auth/register").send({
            email: "admin@suaraksi.id",
            username: "duplicate_admin",
            name: "Duplikat Admin",
            password: "Password123!",
            role: "USER",
        });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.success).toBe(false);
    });
    (0, vitest_1.it)("should enforce RBAC: normal user cannot access admin endpoints", async () => {
        const res = await (0, supertest_1.default)(app)
            .get("/api/admin/dashboard")
            .set("Authorization", `Bearer ${userToken}`);
        (0, vitest_1.expect)(res.status).toBe(403);
        (0, vitest_1.expect)(res.body.success).toBe(false);
    });
    (0, vitest_1.it)("should allow admin to access admin dashboard", async () => {
        const res = await (0, supertest_1.default)(app)
            .get("/api/admin/dashboard")
            .set("Authorization", `Bearer ${adminToken}`);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.totalReports).toBeDefined();
    });
    (0, vitest_1.it)("should allow authenticated user to create a new report", async () => {
        const res = await (0, supertest_1.default)(app)
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
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.success).toBe(true);
        (0, vitest_1.expect)(res.body.data.id).toBeDefined();
        (0, vitest_1.expect)(res.body.data.status).toBe("SUBMITTED");
        createdReportId = res.body.data.id;
    });
    (0, vitest_1.it)("should toggle like and ensure single active like per user", async () => {
        const likeRes1 = await (0, supertest_1.default)(app)
            .post(`/api/reports/${createdReportId}/like`)
            .set("Authorization", `Bearer ${userToken}`);
        (0, vitest_1.expect)(likeRes1.status).toBe(200);
        (0, vitest_1.expect)(likeRes1.body.data.hasLiked).toBe(true);
        (0, vitest_1.expect)(likeRes1.body.data.likesCount).toBe(1);
        const likeRes2 = await (0, supertest_1.default)(app)
            .post(`/api/reports/${createdReportId}/like`)
            .set("Authorization", `Bearer ${userToken}`);
        (0, vitest_1.expect)(likeRes2.status).toBe(200);
        (0, vitest_1.expect)(likeRes2.body.data.hasLiked).toBe(false);
        (0, vitest_1.expect)(likeRes2.body.data.likesCount).toBe(0);
    });
    (0, vitest_1.it)("should toggle UP vote and update upCount", async () => {
        const upRes1 = await (0, supertest_1.default)(app)
            .post(`/api/reports/${createdReportId}/up`)
            .set("Authorization", `Bearer ${userToken}`);
        (0, vitest_1.expect)(upRes1.status).toBe(200);
        (0, vitest_1.expect)(upRes1.body.data.hasUpvoted).toBe(true);
        (0, vitest_1.expect)(upRes1.body.data.upsCount).toBe(1);
        const upRes2 = await (0, supertest_1.default)(app)
            .post(`/api/reports/${createdReportId}/up`)
            .set("Authorization", `Bearer ${userToken}`);
        (0, vitest_1.expect)(upRes2.status).toBe(200);
        (0, vitest_1.expect)(upRes2.body.data.hasUpvoted).toBe(false);
        (0, vitest_1.expect)(upRes2.body.data.upsCount).toBe(0);
    });
    (0, vitest_1.it)("should allow user to comment and create reply", async () => {
        const commentRes = await (0, supertest_1.default)(app)
            .post(`/api/reports/${createdReportId}/comments`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({
            content: "Kondisi ini sangat darurat, mohon pihak berwenang segera memperbaiki.",
        });
        (0, vitest_1.expect)(commentRes.status).toBe(201);
        (0, vitest_1.expect)(commentRes.body.data.id).toBeDefined();
        const commentId = commentRes.body.data.id;
        const replyRes = await (0, supertest_1.default)(app)
            .post(`/api/reports/${createdReportId}/comments`)
            .set("Authorization", `Bearer ${userToken}`)
            .send({
            content: "Setuju, kemarin saya melintas hampir tersandung.",
            parentId: commentId,
        });
        (0, vitest_1.expect)(replyRes.status).toBe(201);
        (0, vitest_1.expect)(replyRes.body.data.parentId).toBe(commentId);
    });
    (0, vitest_1.it)("should allow instance to update report status with notes", async () => {
        const statusRes = await (0, supertest_1.default)(app)
            .patch(`/api/instance/reports/${createdReportId}/status`)
            .set("Authorization", `Bearer ${instanceToken}`)
            .send({
            status: "IN_PROGRESS",
            notes: "Tim teknis lapangan telah meluncur ke lokasi untuk penanganan cepat.",
            evidenceUrls: ["https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800"],
        });
        (0, vitest_1.expect)(statusRes.status).toBe(200);
        (0, vitest_1.expect)(statusRes.body.data.status).toBe("IN_PROGRESS");
    });
    (0, vitest_1.it)("should allow instance to publish an official response", async () => {
        const respRes = await (0, supertest_1.default)(app)
            .post(`/api/instance/reports/${createdReportId}/response`)
            .set("Authorization", `Bearer ${instanceToken}`)
            .send({
            content: "Dinas Bina Marga DKI Jakarta mengonfirmasi perbaikan ubin trotoar ditargetkan rampung hari ini.",
            attachmentUrls: ["https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800"],
        });
        (0, vitest_1.expect)(respRes.status).toBe(201);
        (0, vitest_1.expect)(respRes.body.data.content).toBeDefined();
        (0, vitest_1.expect)(respRes.body.data.instance.isVerified).toBe(true);
    });
    (0, vitest_1.it)("should return trending reports and public stats", async () => {
        const trendRes = await (0, supertest_1.default)(app).get("/api/trending");
        (0, vitest_1.expect)(trendRes.status).toBe(200);
        (0, vitest_1.expect)(Array.isArray(trendRes.body.data)).toBe(true);
        const statsRes = await (0, supertest_1.default)(app).get("/api/trending/stats");
        (0, vitest_1.expect)(statsRes.status).toBe(200);
        (0, vitest_1.expect)(statsRes.body.data.totalReports).toBeGreaterThan(0);
    });
});
