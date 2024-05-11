import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { IImageStorage } from './IImageStorage';
import { ObjectCannedACL, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import axios from 'axios';
import { EnvironmentUtil } from 'src/common/utils/EnvironmentUtil';

@Injectable()
export class S3Service implements IImageStorage {
  private logger: Logger;
  constructor() {
    this.logger = new Logger(S3Service.name);
  }

  private s3Client = new S3Client({
    endpoint: 'https://sgp1.digitaloceanspaces.com',
    forcePathStyle: false,
    region: 'sgp1',
    credentials: {
      accessKeyId: EnvironmentUtil.isDevMode() ? 'DO007ZQBNQXLDCJGBWF4' : 'DO00EB2KGADTAQGDKF6D',
      secretAccessKey: process.env.SPACES_SECRET,
    },
  });

  async uploadFileFromBuffer(buffer: Buffer, folder: string, imageName?: string): Promise<string> {
    try {
      imageName ??= `${Date.now()}`;
      const params = {
        Bucket: EnvironmentUtil.isDevMode() ? 'mangahay-development' : 'mangahay',
        Key: `${folder}/${imageName}`,
        Body: buffer,
        ACL: ObjectCannedACL.public_read,
      };

      await this.s3Client.send(new PutObjectCommand(params));

      return EnvironmentUtil.isDevMode()
        ? `https://mangahay-development.sgp1.digitaloceanspaces.com/${folder}/${imageName}`
        : `https://mangahay.sgp1.digitaloceanspaces.com/${folder}/${imageName}`;
    } catch (error: any) {
      this.logger.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
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
