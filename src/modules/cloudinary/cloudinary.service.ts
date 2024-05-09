import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { v2 } from 'cloudinary';
import { createReadStream } from 'streamifier';
import { IImageStorage } from '../image-storage/IImageStorage';

@Injectable()
export class CloudinaryService implements IImageStorage {
  async uploadFileFromBuffer(buffer: any, folder: string): Promise<string> {
    const result = await new Promise((resolve, reject) => {
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

    return result['secure_url'];
  }

  async uploadMultipleFile(files: any, folder: string): Promise<string[]> {
    return new Promise(async (resolve) => {
      const images: string[] = [];

      for (const file of files) {
        const response_file = await this.uploadFileFromBuffer(file.buffer, folder);

        images.push(response_file);
      }

      resolve(images);
    });
  }

  async uploadImageFromUrl(urlImage: string, folder: string, imageName: string): Promise<string> {
    const response = await axios({
      method: 'get',
      url: urlImage,
      responseType: 'stream',
    });

    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = v2.uploader.upload_stream(
        {
          folder: folder,
          public_id: imageName,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      response.data.pipe(uploadStream);
    });

    return uploadResponse['secure_url'];
  }
}
