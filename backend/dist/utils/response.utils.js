"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendPaginatedSuccess = sendPaginatedSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, message = "Success", status = 200) {
    return res.status(status).json({
        success: true,
        message,
        data,
    });
}
function sendPaginatedSuccess(res, data, meta, message = "Success", status = 200) {
    res.set("X-Total-Count", String(meta.total));
    res.set("X-Page", String(meta.page));
    res.set("X-Limit", String(meta.limit));
    res.set("X-Total-Pages", String(meta.totalPages));
    res.set("Access-Control-Expose-Headers", "X-Total-Count, X-Page, X-Limit, X-Total-Pages");
    return res.status(status).json({
        success: true,
        message,
        data,
    });
}
function sendError(res, message = "Internal Server Error", status = 500, errors) {
    return res.status(status).json({
        success: false,
        message,
        errors,
    });
}
//# sourceMappingURL=response.utils.js.map