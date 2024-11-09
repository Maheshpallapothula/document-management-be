import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ConfigurationService } from "./config.service";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `src/common/config/development.env`,
    }),
  ],
  providers: [ConfigService, ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
