export interface IImageStorage {
  uploadFileFromBuffer(buffer: Buffer, folder: string, imageName?: string): Promise<string>;
  uploadMultipleFile(
    files: Express.Multer.File[],
    folder: string,
    imageName?: string,
  ): Promise<string[]>;
  uploadImageFromUrl(urlImage: string, folder: string, imageName: string): Promise<string>;
}
