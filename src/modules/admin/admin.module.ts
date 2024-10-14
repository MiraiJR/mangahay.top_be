import { Logger, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlideImage } from './entity/SlideImage.entity';
import { AdminResolver } from './admin.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([SlideImage])],
  providers: [AdminService, AdminResolver, Logger],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
