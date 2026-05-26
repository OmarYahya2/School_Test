import fs from "fs";
import path from "path";
import { StorageProvider } from "./storage.provider";
import { env } from "../../config/env";
import { logError } from "../../utils/logger";

export class LocalStorageProvider implements StorageProvider {
  private uploadDir = path.join(__dirname, "../../../../uploads");

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file.buffer) {
      throw new Error("File buffer is empty");
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(filePath, file.buffer);
    return `${env.BACKEND_URL}/uploads/${filename}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (fileUrl.includes("/uploads/")) {
      try {
        const filename = fileUrl.split("/uploads/")[1];
        const filePath = path.join(this.uploadDir, filename);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
        }
      } catch (err) {
        logError(`Failed to delete local file from disk for URL: ${fileUrl}`, err);
      }
    }
  }
}
