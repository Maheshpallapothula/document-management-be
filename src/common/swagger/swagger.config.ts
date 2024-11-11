import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";
import { swgrExcludedPaths } from "./swagger.excludedpaths";

export function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle("Document Management API's")
    .setDescription(
      `The project is a NestJS backend service for managing users, documents, and document ingestion. Key APIs include:
            Authentication APIs: User registration, login, logout, and role management using JWT.

            User Management APIs: Admin-only features for managing user roles and permissions.

            Document Management APIs: CRUD operations for documents (upload, retrieve, delete).

            Ingestion Trigger API: Trigger ingestion processes in the Python backend via API or webhook.

            Ingestion Management API: Track and manage ingestion processes.
            
       The system uses TypeScript, integrates with PostgreSQL, and employs microservices architecture for scalability and interaction with the Python backend.`
    )
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        in: "header",
      },
      "JWT-auth"
    )
    .build();

  const document = SwaggerModule.createDocument(app, options);

  swgrExcludedPaths.forEach((path) => {
    delete document.paths[path];
  });

  SwaggerModule.setup("api-docs", app, document);
}
