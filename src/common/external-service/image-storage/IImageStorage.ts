export interface IImageStorage {
  uploadFileFromBuffer(buffer: Buffer, folder: string, imageName?: string): Promise<UploadedFile>;
  uploadMultipleFile(
    files: Express.Multer.File[],
    folder: string,
    imageName?: string,
  ): Promise<UploadedFile[]>;
  uploadImageFromUrl(urlImage: string, folder: string, imageName: string): Promise<UploadedFile>;
}
