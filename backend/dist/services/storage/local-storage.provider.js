"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
class LocalStorageProvider {
    uploadDir = path_1.default.join(__dirname, "../../../../uploads");
    constructor() {
        if (!fs_1.default.existsSync(this.uploadDir)) {
            fs_1.default.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async uploadFile(file) {
        if (!file.buffer) {
            throw new Error("File buffer is empty");
        }
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        const filePath = path_1.default.join(this.uploadDir, filename);
        await fs_1.default.promises.writeFile(filePath, file.buffer);
        return `${env_1.env.BACKEND_URL}/uploads/${filename}`;
    }
    async deleteFile(fileUrl) {
        if (fileUrl.includes("/uploads/")) {
            try {
                const filename = fileUrl.split("/uploads/")[1];
                const filePath = path_1.default.join(this.uploadDir, filename);
                if (fs_1.default.existsSync(filePath)) {
                    await fs_1.default.promises.unlink(filePath);
                }
            }
            catch (err) {
                (0, logger_1.logError)(`Failed to delete local file from disk for URL: ${fileUrl}`, err);
            }
        }
    }
}
exports.LocalStorageProvider = LocalStorageProvider;
//# sourceMappingURL=local-storage.provider.js.map