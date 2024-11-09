import { Module } from "@nestjs/common";
import { DocumentManagementService } from "./document-management.service";
import { DocumentManagementController } from "./document-management.controller";
import { Documents } from "src/database/entities/document.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import User from "src/database/entities/user.entity";
import { ConfigModule } from "@nestjs/config";
import { ConfigurationService } from "src/common/config/config.service";
import { FileUploadService } from "src/common/utils/file.upload";
import { AuthenticationService } from "../authentication/authentication.service";
import { JwtModule } from "@nestjs/jwt";
import { CacheService } from "src/common/caching/cache.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Documents]),
    JwtModule,
    ConfigModule,
  ],
  controllers: [DocumentManagementController],
  providers: [
    DocumentManagementService,
    AuthenticationService,
    FileUploadService,
    ConfigurationService,
    CacheService,
  ],
})
export class DocumentManagementModule {}
