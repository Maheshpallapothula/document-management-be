import { Injectable, Inject } from "@nestjs/common";
import { Cache } from "cache-manager";

@Injectable()
export class CacheService {
  constructor(@Inject("CACHE_MANAGER") private readonly cacheManager: Cache) {}

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, { ttl } as any);
  }

  async get(key: string): Promise<any> {
    return await this.cacheManager.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async checkUserIdExists(userId: string): Promise<boolean> {
    const result = await this.cacheManager.get(userId);
    return result !== null;
  }
}
