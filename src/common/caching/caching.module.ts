import { Global, Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ConfigurationModule } from "../config/config.module";
import { ConfigurationService } from "../config/config.service";
const redisStore = require("cache-manager-redis-store").redisStore;

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigurationModule],
      useFactory: async (config: ConfigurationService) => ({
        store: redisStore,
        host: config.get("REDIS_HOST"),
        port: config.get("REDIS_PORT"),
        auth_pass: config.get("REDIS_PASS"),
      }),
      inject: [ConfigurationService],
    }),
  ],
  exports: [CacheModule],
})
export class CachingModule {}
