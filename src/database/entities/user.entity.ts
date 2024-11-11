import { Role } from "src/common/utils/enums";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";

@Entity({ name: "users" })
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id: string;

  @Column({ type: String, unique: true, name: "email" })
  email: string;

  @Column({ type: String, unique: true, name: "username" })
  username: string;

  @Column({ type: String, unique: true, name: "password" })
  password: string;

  @Column({ type: String, unique: true, name: "salt" })
  salt: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.Viewer,
    name: "role",
  })
  role: Role;

  @CreateDateColumn({ type: Date, nullable: true, name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: Date, nullable: true, name: "updated_at" })
  updatedAt: Date;
}
