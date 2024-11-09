import { Injectable } from "@nestjs/common";
import { CacheService } from "./common/caching/cache.service";
import { GetHelloDTO } from "./common/utils/common.dto";

@Injectable()
export class AppService {
  constructor(private readonly redis: CacheService) {}

  async getHello(): Promise<GetHelloDTO> {
    // Just check whether redis is working or not..
    await this.redis.set(
      "DOCUMENT_DB",
      { from: "redis-cache", value: "Hello From DOCUMENT_DB" },
      20 // If works then generate a key and store it for 20 seconds
    );
    // Return the redis result so that we can conclude the server is live.
    const result: GetHelloDTO = await this.redis.get("DOCUMENT_DB");
    return result;
  }
}
