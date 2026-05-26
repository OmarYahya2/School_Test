"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = getPaginationParams;
function getPaginationParams(query) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || "20", 10)));
    const skip = (page - 1) * limit;
    const take = limit;
    return { skip, take, page, limit };
}
//# sourceMappingURL=pagination.utils.js.map