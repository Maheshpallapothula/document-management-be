import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, NotContains, Validate } from "class-validator";
import {
  RemoveWhiteSpaces,
  ValidatePassword,
} from "src/common/utils/input-validator";
import { MESSAGES } from "src/common/utils/messages";

export class LoginCredentialsDTO {
  @ApiProperty()
  @IsNotEmpty({ message: "Email should not be empty." })
  @NotContains("undefined")
  @NotContains("null")
  @IsEmail({}, { message: "Please enter a valid email address." })
  email?: string;

  @ApiProperty()
  @IsNotEmpty({ message: "Password should not be empty." })
  @NotContains("undefined")
  @NotContains("null")
  password: string;
}

export class UserDetailsDTO {
  @ApiProperty()
  @IsNotEmpty()
  @NotContains("undefined")
  @NotContains("null")
  @IsEmail({}, { message: "Please enter a valid email address." })
  email?: string;

  @ApiProperty()
  @IsNotEmpty()
  @NotContains("undefined")
  @NotContains("null")
  @Validate(RemoveWhiteSpaces, {
    message: MESSAGES.ERROR.EMPTY_PASSWORD,
  })
  @Validate(ValidatePassword, {
    message: MESSAGES.ERROR.INVALID_PASSWORD,
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty({ message: "userName hsould not be empty." })
  @NotContains("undefined")
  @NotContains("null")
  userName: string;
}

export class LoginResponseDTO {
  isOk: boolean;
  accessToken: string;
  refreshToken: string;
  user: { _id: string; userName: string; email: string };
}

export class RefreshTokenDTO {
  isOk: boolean;
  accessToken: string;
}
