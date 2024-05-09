import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../image-storage/s3.service';

@Controller('api/admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private logger: Logger = new Logger(AdminController.name),
    private s3Service: S3Service,
  ) {}

  @Put('/change-slide')
  @UseInterceptors(FileInterceptor('file'))
  async changeSlide(
    @Body() body: any,
    @Res() response: Response,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const res = await this.s3Service
        .uploadFileFromBuffer(file.buffer, `slide-image`)
        .then((data: any) => {
          this.adminService.changeSlideImage(parseInt(body.index), data.url);
          return data;
        });

      return response.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Thay đổi ảnh slide thành công!',
        result: {
          index: body.index,
          link_image: res.url,
        },
      });
    } catch (error) {
      this.logger.error(error);
      return response.status(error.status | 500).json({
        statusCode: error.status | 500,
        success: false,
        message: 'INTERNAL SERVER ERROR',
      });
    }
  }
}
