# document-management-be

## Prerequisites

- Ensure Redis is installed on your system. This project uses Redis for caching.

## Setup Instructions

1. **Install Dependencies**
   - Run `npm install` to install all project dependencies.

2. **Configure Environment**
   - Update the `development.env` file with your environment-specific configuration.
   - Update the `dataSource.ts` file to set up the correct database credentials.

3. **Run Migrations**
   - Execute the following command to run the database migrations:
     ```sh
     npm run migration:up
     ```
   - This command will create two tables: `document` and `users` in the database.
   - The initial admin user will also be created with the following credentials:
     - **Email**: `admin@dmb.com`
     - **Password**: `Passd@1234`
     - Note: The password is encrypted with a salt and should not be changed.

## Authentication

- You can log in as an admin using the above credentials.
- To create a new user, use the `/auth/user/register` endpoint.
  - By default, the new user will have a role of `viewer`.
  - Note: User roles cannot be updated after creation, and a `viewer` role has limited permissions.

- **Refresh Token API**
  - The `/api/refresh_token` endpoint provides a new access token after every 60 seconds.
  - The token will automatically log out after 60 seconds, so make sure to call the refresh token endpoint to maintain an active session.

## Document Management

- Documents can be accessed based on user roles.
- All roles can upload, retrieve, and delete their own documents.
- The following APIs are available for document management:
  - Upload, retrieve, and delete user files.

## Ingestion APIs

- **Trigger Ingestion**: The `/trigger` API will initiate the ingestion process and return the message `Ingestion process initiated`.
- **Ingestion Status**: The `/status` API returns the current status of the ingestion process.

## Notes

- Please follow the role-based access for documents as implemented.
- Ensure the Redis server is running before starting the application.

## Commands Executed for Dependency Installation

- Run `nest new document-management-be`
- `npm install @nestjs/passport passport passport-jwt @nestjs/jwt`
- `npm install @nestjs/typeorm typeorm pg`
- `npm i --save @nestjs/config`
- `npm i --save @nestjs/cache-manager`
- `npm i cache-manager-redis-store`
- `npm i winston moment winston-daily-rotate-file`
- `npm i @nestjs/swagger`
- `npm i bcrypt`
- `npm i uuid`
- `npm install @nestjs/jwt @nestjs/passport passport passport-jwt`
- `npm install @types/passport-jwt --save-dev`
- `npm install multer`
- `npm install --save-dev @types/multer`
- `npm install aws-sdk`
- Run `nest g res modules/authentication` (for new module creation.)

