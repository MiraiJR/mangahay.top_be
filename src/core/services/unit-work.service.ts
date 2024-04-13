import { Global, HttpException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Comic } from 'src/modules/comic/comic.entity';
import { DataSource, EntityManager, EntitySchema, ObjectLiteral, Repository } from 'typeorm';

@Global()
@Injectable()
export class UnitOfWorkService {
  constructor(
    @InjectDataSource()
    private readonly connection: DataSource,
  ) {
    this.manager = this.connection.manager;
  }

  private manager: EntityManager;

  getManager(entity: Function) {
    return this.manager.getRepository(entity);
  }

  async doTransactional<T>(fn): Promise<T> {
    let result: T;
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    this.manager = queryRunner.manager;

    try {
      result = await fn(this.manager);
      await queryRunner.commitTransaction();
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, error.statusCode);
    } finally {
      await queryRunner.release();
    }

    return result;
  }
}
