import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { setupSwagger } from "./common/swagger/swagger.config";
import { BadRequestException, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const RUNPORT = process.env.PORT ? process.env.PORT : 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // This might be causing the 'should not exist' error if not needed
      transform: true, // Transform payload to match the expected DTO type
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          property: error.property,
          errors: Object.values(error.constraints),
        }));
        return new BadRequestException(messages);
      },
    })
  );
  app.useGlobalFilters();

  setupSwagger(app); /*Setting swagger config app file*/

  await app.listen(RUNPORT);
}
bootstrap();
