"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const local_storage_provider_1 = require("./local-storage.provider");
const s3_storage_provider_1 = require("./s3-storage.provider");
const env_1 = require("../../config/env");
class StorageServiceManager {
    activeProvider;
    constructor() {
        if (env_1.env.STORAGE_PROVIDER === "s3") {
            this.activeProvider = new s3_storage_provider_1.S3StorageProvider();
        }
        else {
            this.activeProvider = new local_storage_provider_1.LocalStorageProvider();
        }
    }
    async uploadFile(file) {
        return this.activeProvider.uploadFile(file);
    }
    async deleteFile(fileUrl) {
        return this.activeProvider.deleteFile(fileUrl);
    }
}
exports.StorageService = new StorageServiceManager();
//# sourceMappingURL=storage.service.js.map