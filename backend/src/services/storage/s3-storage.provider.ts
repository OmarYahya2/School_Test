import { StorageProvider } from "./storage.provider";
import { env } from "../../config/env";
import { logError } from "../../utils/logger";
import path from "path";

export class S3StorageProvider implements StorageProvider {
  private s3Client: any = null;

  private async getS3Client() {
    if (this.s3Client) return this.s3Client;

    try {
      const sdk = await Function('return import("@aws-sdk/client-s3")')();
      const S3Client = sdk.S3Client;
      this.s3Client = new S3Client({
        region: env.AWS_REGION,
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });
      return this.s3Client;
    } catch (err) {
      logError("Failed to import or initialize @aws-sdk/client-s3. Ensure the dependency is installed.", err);
      throw new Error("S3 storage client not available. AWS SDK is missing or misconfigured.");
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file.buffer) {
      throw new Error("File buffer is empty");
    }

    const s3 = await this.getS3Client();
    const sdk = await Function('return import("@aws-sdk/client-s3")')();
    const PutObjectCommand = sdk.PutObjectCommand;

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const key = `uploads/${file.fieldname}-${uniqueSuffix}${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const s3 = await this.getS3Client();
      const sdk = await Function('return import("@aws-sdk/client-s3")')();
      const DeleteObjectCommand = sdk.DeleteObjectCommand;

      const hostUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/`;
      if (!fileUrl.startsWith(hostUrl)) {
        return;
      }
      const key = fileUrl.replace(hostUrl, "");

      await s3.send(
        new DeleteObjectCommand({
          Bucket: env.AWS_S3_BUCKET,
          Key: key,
        })
      );
    } catch (err) {
      logError(`Failed to delete S3 file for URL: ${fileUrl}`, err);
    }
  }
}
