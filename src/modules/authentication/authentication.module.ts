import { Module } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { AuthenticationController } from "./authentication.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import User from "src/database/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { CacheService } from "src/common/caching/cache.service";
import { AuthInterceptor } from "src/common/utils/jwt-interceptor";

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule, ConfigModule],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, CacheService, AuthInterceptor],
})
export class AuthenticationModule {}
