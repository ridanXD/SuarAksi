"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
    res.status(statusCode).json({
        success: false,
        message: err.message || "Terjadi kesalahan internal server",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
}
