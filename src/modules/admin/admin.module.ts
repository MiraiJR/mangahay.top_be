import { Logger, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlideImage } from './entity/SlideImage.entity';
import { AdminResolver } from './admin.resolver';
import { S3Module } from '../image-storage/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([SlideImage]), S3Module],
  providers: [AdminService, AdminResolver, Logger],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
