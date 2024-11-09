import { Global, Module } from "@nestjs/common";
import { ConfigurationModule } from "../config/config.module";
import { LoggingService } from "./logging.service";

@Global()
@Module({
  imports: [ConfigurationModule],
  exports: [LoggingService],
  providers: [LoggingService],
})
export class LoggingModule {}
