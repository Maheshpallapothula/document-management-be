import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { LoggingModule } from "./common/logging/logging.module";
import { ConfigurationModule } from "./common/config/config.module";
import { CachingModule } from "./common/caching/caching.module";
import { ConfigurationService } from "./common/config/config.service";
import { ConfigService } from "@nestjs/config";
import { CacheService } from "./common/caching/cache.service";
import { IngestionModule } from "./modules/ingestion/ingestion.module";
import { DocumentManagementModule } from "./modules/document-management/document-management.module";
import { AuthenticationModule } from "./modules/authentication/authentication.module";

@Module({
  imports: [
    CachingModule,
    ConfigurationModule,
    LoggingModule,
    DatabaseModule,
    AuthenticationModule,
    DocumentManagementModule,
    IngestionModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigurationService, ConfigService, CacheService],
})
export class AppModule {}
