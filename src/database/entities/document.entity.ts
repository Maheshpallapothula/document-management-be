// src/documents/document.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./user.entity";

@Entity({ name: "documents" })
export class Documents extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  _id?: string;

  @Column({ type: String, nullable: true, name: "title" })
  title: string;

  @Column({ type: String, nullable: true, name: "s3Url" })
  s3Url: string;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn({ name: "user_id", referencedColumnName: "_id" })
  user_id: User;

  @CreateDateColumn({ type: Date, nullable: true, name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: Date, nullable: true, name: "updated_at" })
  updatedAt: Date;
}
