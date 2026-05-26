export interface StorageProvider {
  /**
   * Uploads a file and returns its public URL.
   */
  uploadFile(file: Express.Multer.File): Promise<string>;

  /**
   * Deletes a file given its public URL.
   */
  deleteFile(fileUrl: string): Promise<void>;
}
