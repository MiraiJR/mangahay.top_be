import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { createReadStream } from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFileFromBuffer(buffer: any, folder: string): object {
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
}
