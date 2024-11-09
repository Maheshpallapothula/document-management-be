import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1731045040707 implements MigrationInterface {
  name = "CreateUserTable1731045040707";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'editor', 'viewer')`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "salt" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'viewer', "created_at" TIMESTAMP DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_638bac731294171648258260ff2" UNIQUE ("password"), CONSTRAINT "UQ_e2e02f59d9d115d5c6af3739eb5" UNIQUE ("salt"), CONSTRAINT "PK_457bfa3e35350a716846b03102d" PRIMARY KEY ("_id"))`
    );

    // Insert a dummy admin user
    await queryRunner.query(
      `INSERT INTO "users" ("_id", "email", "username", "password", "salt", "role", "created_at", "updated_at") VALUES (uuid_generate_v4(), 'admin@dmb.com', 'justadmin', '$2b$10$Qh0qcFrPnTuIrqb6vV5r6eEfpBZgSc7SHEUTmvAuLbEoPn0QPpD.2', '$2b$10$Qh0qcFrPnTuIrqb6vV5r6e', 'admin', now(), now())`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
