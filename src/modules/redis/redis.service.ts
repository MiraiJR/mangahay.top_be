import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RedisPrefixKey } from './enums/RedisEnum';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private redisCache: Cache,
  ) {}

  async getObjectByKey<T>(key: string, type: RedisPrefixKey): Promise<T> {
    const value = await this.redisCache.get(`${type}:${key}`);

    return value ? JSON.parse(`${value}`) : null;
  }

  async setObjectByKeyValue<T>(
    key: string,
    value: T,
    ttl: number,
    type: RedisPrefixKey,
  ): Promise<void> {
    await this.redisCache.set(`${type}:${key}`, JSON.stringify(value), {
      ttl,
    });
  }

  async deleteObjectByKey(key: string, type: RedisPrefixKey): Promise<void> {
    const value = await this.getObjectByKey(key, type);
    if (value) {
      return this.redisCache.del(key);
    }
  }
}
