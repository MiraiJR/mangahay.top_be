import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemDataEntity } from './system-data.entity';
import { SystemDataRepository } from './system-data.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SystemDataEntity])],
  controllers: [],
  providers: [SystemDataRepository],
  exports: [SystemDataRepository],
})
export class SystemDataModule {}
