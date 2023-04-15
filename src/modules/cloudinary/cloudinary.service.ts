import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { createReadStream } from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFileFromBuffer(buffer: any, folder: string): any {
    return new Promise((resolve, reject) => {
      const cld_upload_stream = v2.uploader.upload_stream(
        {
          folder: `${folder}`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      createReadStream(buffer).pipe(cld_upload_stream);
    });
  }

  async uploadMultipleFile(files: any, folder: string): Promise<any> {
    return new Promise(async (resolve) => {
      const images: string[] = [];

      for (const file of files) {
        const response_file = await this.uploadFileFromBuffer(
          file.buffer,
          folder,
        );

        images.push(response_file.url);
      }

      resolve(images);
    });
  }
}
