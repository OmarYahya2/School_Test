"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageProvider = void 0;
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
const path_1 = __importDefault(require("path"));
class S3StorageProvider {
    s3Client = null;
    async getS3Client() {
        if (this.s3Client)
            return this.s3Client;
        try {
            const sdk = await Function('return import("@aws-sdk/client-s3")')();
            const S3Client = sdk.S3Client;
            this.s3Client = new S3Client({
                region: env_1.env.AWS_REGION,
                credentials: {
                    accessKeyId: env_1.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: env_1.env.AWS_SECRET_ACCESS_KEY,
                },
            });
            return this.s3Client;
        }
        catch (err) {
            (0, logger_1.logError)("Failed to import or initialize @aws-sdk/client-s3. Ensure the dependency is installed.", err);
            throw new Error("S3 storage client not available. AWS SDK is missing or misconfigured.");
        }
    }
    async uploadFile(file) {
        if (!file.buffer) {
            throw new Error("File buffer is empty");
        }
        const s3 = await this.getS3Client();
        const sdk = await Function('return import("@aws-sdk/client-s3")')();
        const PutObjectCommand = sdk.PutObjectCommand;
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        const key = `uploads/${file.fieldname}-${uniqueSuffix}${ext}`;
        await s3.send(new PutObjectCommand({
            Bucket: env_1.env.AWS_S3_BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        return `https://${env_1.env.AWS_S3_BUCKET}.s3.${env_1.env.AWS_REGION}.amazonaws.com/${key}`;
    }
    async deleteFile(fileUrl) {
        try {
            const s3 = await this.getS3Client();
            const sdk = await Function('return import("@aws-sdk/client-s3")')();
            const DeleteObjectCommand = sdk.DeleteObjectCommand;
            const hostUrl = `https://${env_1.env.AWS_S3_BUCKET}.s3.${env_1.env.AWS_REGION}.amazonaws.com/`;
            if (!fileUrl.startsWith(hostUrl)) {
                return;
            }
            const key = fileUrl.replace(hostUrl, "");
            await s3.send(new DeleteObjectCommand({
                Bucket: env_1.env.AWS_S3_BUCKET,
                Key: key,
            }));
        }
        catch (err) {
            (0, logger_1.logError)(`Failed to delete S3 file for URL: ${fileUrl}`, err);
        }
    }
}
exports.S3StorageProvider = S3StorageProvider;
//# sourceMappingURL=s3-storage.provider.js.map