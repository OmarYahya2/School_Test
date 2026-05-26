"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const express_validator_1 = require("express-validator");
const response_utils_1 = require("../utils/response.utils");
function validate(req, res, next) {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, response_utils_1.sendError)(res, "Validation failed.", 400, errors.array());
    }
    next();
}
//# sourceMappingURL=validate.middleware.js.map