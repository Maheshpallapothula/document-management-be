// src/documents/document.service.ts
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as AWS from "aws-sdk";
import User from "src/database/entities/user.entity";
import { ConfigurationService } from "../config/config.service";
import { v4 as uuidv4 } from "uuid";
import { Documents } from "src/database/entities/document.entity";
import { MESSAGES } from "./messages";
import { LoggingService } from "../logging/logging.service";

@Injectable()
export class FileUploadService {
  private s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  constructor(
    @InjectRepository(Documents) private documentRepo: Repository<Documents>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private config: ConfigurationService,
    private log: LoggingService
  ) {}

  async uploadFile(userId, file): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { _id: userId },
      });
      if (!user) {
        throw new HttpException(
          MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.UNAUTHORIZED
        );
      }

      const uploadResult = await this.s3
        .upload({
          Bucket: this.config.get("BUCKET_NAME"),
          Key: `${userId}/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
        })
        .promise();

      const _id = uuidv4();
      const newDocument = this.documentRepo.create({
        _id,
        title: file.originalname,
        s3Url: uploadResult.Location,
        user_id: userId,
      });

      await this.documentRepo.save(newDocument);
      return {
        isOK: true,
        message: MESSAGES.SUCCESS.DOCUMENT_UPLOADED,
      };
    } catch (error) {
      this.log.error(MESSAGES.ERROR.UPLOAD_FILE_ERROR, error);
      throw new HttpException(
        error.message ? error.message : MESSAGES.ERROR.UPLOAD_FILE_ERROR,
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}
