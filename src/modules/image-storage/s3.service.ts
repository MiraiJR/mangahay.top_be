import { Injectable } from '@nestjs/common';
import { IImageStorage } from './IImageStorage';
import { ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import axios from 'axios';

@Injectable()
export class S3Service implements IImageStorage {
  private s3Client = new S3Client({
    endpoint: 'https://sgp1.digitaloceanspaces.com',
    forcePathStyle: false,
    region: 'sgp1',
    credentials: {
      accessKeyId: 'DO00EB2KGADTAQGDKF6D',
      secretAccessKey: process.env.SPACES_SECRET,
    },
  });

  async uploadFileFromBuffer(buffer: Buffer, folder: string, imageName?: string): Promise<string> {
    try {
      imageName ??= `${Date.now()}`;
      const params = {
        Bucket: 'mangahay',
        Key: `${folder}/${imageName}`,
        Body: buffer,
        ACL: ObjectCannedACL.public_read,
      };

      await this.s3Client.send(new PutObjectCommand(params));

      return `https://mangahay.sgp1.digitaloceanspaces.com/${folder}/${imageName}`;
    } catch (err) {
      console.log('Error', err);
    }
  }

  async uploadMultipleFile(files: Express.Multer.File[], folder: string): Promise<string[]> {
    const result = [];

    for (let i = 0; i < files.length; i++) {
      const imageUrl = await this.uploadFileFromBuffer(files[i].buffer, folder, `${i}.jpeg`);
      result.push(imageUrl);
    }

    return result;
  }

  async uploadImageFromUrl(urlImage: string, folder: string, imageName: string): Promise<string> {
    const response = await axios({
      method: 'get',
      url: urlImage,
      responseType: 'arraybuffer',
    });

    return this.uploadFileFromBuffer(response.data, folder, imageName);
  }
}
