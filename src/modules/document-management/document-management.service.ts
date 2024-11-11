import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LoggingService } from "src/common/logging/logging.service";
import { FileUploadService } from "src/common/utils/file.upload";
import { MESSAGES } from "src/common/utils/messages";
import { Documents } from "src/database/entities/document.entity";
import User from "src/database/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class DocumentManagementService {
  constructor(
    private fileUploadService: FileUploadService,
    private log: LoggingService,
    @InjectRepository(Documents) private documentRepo: Repository<Documents>,
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}

  async uploadFile(userId: String, file) {
    try {
      return await this.fileUploadService.uploadFile(userId, file[0]);
    } catch (error) {
      this.log.error(MESSAGES.ERROR.UPLOAD_FILE_ERROR, error);
      throw new HttpException(
        error.message ? error.message : MESSAGES.ERROR.UPLOAD_FILE_ERROR,
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  async getUserUploadedFiles(userId: string) {
    try {
      const user = await this.userRepo.findOne({
        where: { _id: userId },
      });
      if (!user) {
        throw new HttpException(
          MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.UNAUTHORIZED
        );
      }

      const documents = await this.documentRepo.find({
        where: {
          user_id: {
            _id: userId,
          },
        },
      });

      if (!documents.length) {
        throw new HttpException(
          MESSAGES.ERROR.DOCUMENTS_NOT_FOUND,
          HttpStatus.UNAUTHORIZED
        );
      }

      return {
        isOk: true,
        message: MESSAGES.SUCCESS.DOCUMENTS_RETRIEVED,
        documents,
      };
    } catch (error) {
      this.log.error(MESSAGES.ERROR.USER_FILES_RETRIEVE, error);
      throw new HttpException(
        error.message ? error.message : MESSAGES.ERROR.USER_FILES_RETRIEVE,
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  async deleteUserUploadedFiles(documentId: string, userId: string) {
    try {
      const user = await this.documentRepo.findOne({
        where: {
          _id: documentId,
          user_id: {
            _id: userId,
          },
        },
      });
      if (!user) {
        throw new HttpException(
          MESSAGES.ERROR.DOCUMENT_NOT_FOUND,
          HttpStatus.UNAUTHORIZED
        );
      }

      await this.documentRepo.delete({
        _id: documentId,
      });

      return {
        isOk: true,
        message: MESSAGES.SUCCESS.DOCUMENT_DELETED,
      };
    } catch (error) {
      this.log.error(MESSAGES.ERROR.USER_FILES_DELETE, error);
      throw new HttpException(
        error.message ? error.message : MESSAGES.ERROR.USER_FILES_DELETE,
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}
