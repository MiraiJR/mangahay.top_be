import { Logger, Module, forwardRef } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    JwtModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([Message]),
  ],
  controllers: [MessageController],
  providers: [MessageService, Logger],
  exports: [MessageService],
})
export class MessageModule {}
