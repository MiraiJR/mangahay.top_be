import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class TransactionDatabase {
  private queryRunner: QueryRunner;

  constructor(private dataSource: DataSource) {}

  async startTransaction(): Promise<void> {
    if (this.queryRunner && this.queryRunner.isTransactionActive) {
      return;
    }

    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.startTransaction();
  }

  async commitTransaction(): Promise<void> {
    if (!this.queryRunner || !this.queryRunner.isTransactionActive) {
      return;
    }

    await this.queryRunner.commitTransaction();
  }

  async rollBackTransaction(): Promise<void> {
    if (!this.queryRunner || !this.queryRunner.isTransactionActive) {
      return;
    }

    await this.queryRunner.rollbackTransaction();
  }

  async releaseTransaction(): Promise<void> {
    if (this.queryRunner) {
      await this.queryRunner.release();
      this.queryRunner = null;
    }
  }
}
