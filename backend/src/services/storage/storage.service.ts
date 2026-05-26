import { StorageProvider } from "./storage.provider";
import { LocalStorageProvider } from "./local-storage.provider";
import { S3StorageProvider } from "./s3-storage.provider";
import { env } from "../../config/env";

class StorageServiceManager implements StorageProvider {
  private activeProvider: StorageProvider;

  constructor() {
    if (env.STORAGE_PROVIDER === "s3") {
      this.activeProvider = new S3StorageProvider();
    } else {
      this.activeProvider = new LocalStorageProvider();
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return this.activeProvider.uploadFile(file);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    return this.activeProvider.deleteFile(fileUrl);
  }
}

export const StorageService = new StorageServiceManager();
