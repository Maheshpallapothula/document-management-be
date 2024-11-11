import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  Req,
  HttpCode,
  Get,
  Delete,
  Param,
} from "@nestjs/common";
import { DocumentManagementService } from "./document-management.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { MESSAGES } from "src/common/utils/messages";
import { ApiBody, ApiConsumes, ApiSecurity } from "@nestjs/swagger";
import {
  FileUploadDto,
  GetUserUploadedFilesDTO,
} from "./dto/document.manage.dto";
import { AuthInterceptor } from "src/common/utils/jwt-interceptor";
import { successResponse } from "src/common/swagger/swagger.api.response";
import { SuccessResponseDTO } from "src/common/utils/common.dto";

@ApiSecurity("JWT-auth")
@UseInterceptors(AuthInterceptor)
@Controller("document")
export class DocumentManagementController {
  constructor(
    private readonly documentManagementService: DocumentManagementService
  ) {}

  @Post("upload")
  @HttpCode(200)
  @successResponse(200, "Success Response.", false, {
    properties: {
      isOk: { default: true },
      message: { type: "string", default: "Document uploaded successfully" },
    },
  })
  @ApiConsumes("multipart/form-data") // Specify that this endpoint consumes multipart/form-data
  @ApiBody({
    description: "Document file", // Description of the request body
    type: FileUploadDto, // Define the DTO class for the request body
  })
  @UseInterceptors(FileFieldsInterceptor([{ name: "file", maxCount: 1 }]))
  async uploadFile(
    @UploadedFiles()
    file: {
      file?: Express.Multer.File[];
    },
    @Req() request
  ): Promise<SuccessResponseDTO> {
    if (!file || !file.file) {
      throw new HttpException(MESSAGES.ERROR.NO_FILES_SELECTED, 400);
    }

    return await this.documentManagementService.uploadFile(
      request?.userId,
      file.file
    );
  }

  @Get("user/files")
  @HttpCode(200)
  @successResponse(200, "Success Response.", false, {
    properties: {
      isOk: { default: true },
      message: {
        type: "string",
        default: "Document's successfully retrieved.",
      },
      documents: { type: "array", default: [] },
    },
  })
  async getUserUploadedFiles(@Req() request): Promise<GetUserUploadedFilesDTO> {
    return await this.documentManagementService.getUserUploadedFiles(
      request?.userId
    );
  }

  @Delete(":documentId")
  @HttpCode(200)
  @successResponse(200, "Success Response.", false, {
    properties: {
      isOk: { default: true },
      message: {
        type: "string",
        default: "Document's successfully deleted.",
      },
    },
  })
  async deleteUserUploadedFiles(
    @Param("documentId") documentId: string,
    @Req() request
  ): Promise<SuccessResponseDTO> {
    return await this.documentManagementService.deleteUserUploadedFiles(
      documentId,
      request?.userId
    );
  }
}
