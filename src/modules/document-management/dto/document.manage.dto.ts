import { ApiProperty } from "@nestjs/swagger";
import { SuccessResponseDTO } from "src/common/utils/common.dto";

export class FileUploadDto {
  @ApiProperty({ type: "string", format: "binary" }) // Specify that this property is a binary file
  file: any;
}

export class GetUserUploadedFilesDTO extends SuccessResponseDTO {
  documents: Array<any>;
}
