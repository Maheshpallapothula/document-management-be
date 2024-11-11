import { DataSource } from "typeorm";

/* For run migrations need data source export connection.*/
export const dataBaseSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "1234",
  database: "document-management",
  logging: false,
  synchronize: false,
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/migrations/*.js"],
});
