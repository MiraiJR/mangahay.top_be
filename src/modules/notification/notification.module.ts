import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { JwtModule } from '@nestjs/jwt';
import { NotificationRepository } from './notification.repository';
import { NotificationProcessor } from './notification.processor';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository, NotificationProcessor],
  exports: [NotificationService, NotificationRepository],
})
export class NotificationModule {}
