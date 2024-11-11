import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigurationModule } from "src/common/config/config.module";
import { ConfigurationService } from "src/common/config/config.service";
import { DataSource } from "typeorm";
@Module({
  imports: [
    // For Application connection we are intializing the module in the app.module file and passing the below data base connection..
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (config: ConfigurationService) => ({
        type: "postgres",
        host: config.get("DB_HOST"),
        port: config.get("DB_PORT"),
        username: config.get("DB_USERNAME"),
        password: config.get("DB_PASSWORD"),
        database: config.get("DB_DATABASE"),
        synchronize: false,
        logging: false,
        entities: [__dirname + "/../**/*.entity.{ts,js}"],
        migrations: [__dirname + "/../**/*.migration{.ts}"],
      }),
      dataSourceFactory: async (options) =>
        await new DataSource(options).initialize(),
    }),
  ],
})
export class DatabaseModule {}
