import { Injectable, Logger } from '@nestjs/common';
import { IImageStorage } from './IImageStorage';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import axios from 'axios';
import { ApplicationException } from '@common/exception/application.exception';
import CommonError from '@common/resources/error/error';

@Injectable()
export class S3Service implements IImageStorage {
  private logger: Logger;
  private s3Client: S3Client;

  constructor() {
    this.logger = new Logger(S3Service.name);
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.ACCESSKEY_ID,
        secretAccessKey: process.env.ACCESSKEY_SECRET,
      },
    });
  }

  async uploadFileFromBuffer(
    buffer: Buffer,
    folder: string,
    imageName?: string,
  ): Promise<UploadedFile> {
    await this.createIfNotExistBucket();

    try {
      imageName ??= `${Date.now()}.jpeg`;
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `${folder}/${imageName}`,
        Body: buffer,
        ACL: ObjectCannedACL.public_read,
      };

      await this.s3Client.send(new PutObjectCommand(params));

      return {
        url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${folder}/${imageName}`,
        relativePath: `${folder}/${imageName}`,
      };
    } catch (error: any) {
      this.logger.error(error);
      throw new ApplicationException(CommonError.COMMON_ERROR_0001);
    }
  }

  async uploadMultipleFile(files: Express.Multer.File[], folder: string): Promise<UploadedFile[]> {
    const result = [];

    for (let i = 0; i < files.length; i++) {
      const uploadedFile = await this.uploadFileFromBuffer(files[i].buffer, folder, `${i}.jpeg`);
      result.push(uploadedFile);
    }

    return result;
  }

  async uploadImageFromUrl(
    urlImage: string,
    folder: string,
    imageName: string,
  ): Promise<UploadedFile> {
    const response = await axios({
      method: 'get',
      url: urlImage,
      responseType: 'arraybuffer',
    });

    return this.uploadFileFromBuffer(response.data, folder, imageName);
  }

  private async createIfNotExistBucket() {
    try {
      await this.checkExistedBucket();
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        const input = {
          Bucket: process.env.S3_BUCKET,
        };
        const command = new CreateBucketCommand(input);
        const response = await this.s3Client.send(command);
        if (response.$metadata?.httpStatusCode !== 200) {
          throw new ApplicationException(CommonError.COMMON_ERROR_0001);
        }
      } else {
        throw new ApplicationException(CommonError.COMMON_ERROR_0001);
      }
    }
  }

  private async checkExistedBucket() {
    const input = {
      Bucket: process.env.S3_BUCKET,
    };
    const command = new HeadBucketCommand(input);
    await this.s3Client.send(command);
  }
}
