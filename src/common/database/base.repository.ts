import { ENTITY_MANAGER_KEY } from '@common/interceptor/transaction.interceptor';
import { DataSource, EntityManager, Repository } from 'typeorm';

export abstract class BaseRepository<Entity> {
  constructor(protected dataSource: DataSource, private request: Request) {}

  public getRepository(): Repository<Entity> {
    const entityManager: EntityManager =
      this.request[ENTITY_MANAGER_KEY] ?? this.dataSource.manager;
    const entityCls = this.getEntityClass();
    return entityManager.getRepository(entityCls);
  }

  protected abstract getEntityClass(): new () => Entity;
}
