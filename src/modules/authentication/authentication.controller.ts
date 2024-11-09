import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import {
  LoginCredentialsDTO,
  LoginResponseDTO,
  RefreshTokenDTO,
  UserDetailsDTO,
} from "./dto/authentication.dto";
import { successResponse } from "src/common/swagger/swagger.api.response";
import { ApiParam, ApiSecurity } from "@nestjs/swagger";
import { AuthInterceptor } from "src/common/utils/jwt-interceptor";
import { MESSAGES } from "src/common/utils/messages";
import { Role } from "src/common/utils/enums";
import { SuccessResponseDTO } from "src/common/utils/common.dto";

@Controller("auth")
export class AuthenticationController {
  constructor(private readonly loginService: AuthenticationService) {}

  @Post("user/register")
  @successResponse(200, "Success Response.", false, {
    properties: {
      isOk: { default: true },
      message: { type: "string", default: "User registered successfully." },
    },
  })
  async register(
    @Body() userDetails: UserDetailsDTO
  ): Promise<SuccessResponseDTO> {
    return await this.loginService.createUser(userDetails);
  }

  @Post("/login")
  @successResponse(200, "Success Response.", false, {
    properties: {
      accessToken: {
        default:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1AcC5jb20iLCJ1c2VySWQiOiJlNTg0YWRmOC1kOGU1LTQzYTMtYTJiZS0wZDExMTlhNTgwMDgiLCJpYXQiOjE3MzExNTg2OTV9.aH0Hg5caiCSspts5dClXsgQa5xAZwZbAuwKLuJu6EK0",
      },
      refreshToken: {
        default:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1AcC5jb20iLCJ1c2VySWQiOiJlNTg0YWRmOC1kOGU1LTQzYTMtYTJiZS0wZDExMTlhNTgwMDgiLCJpYXQiOjE3MzExNTg2OTUsImV4cCI6MTczMTc2MzQ5NX0.G8xIFyjrho5uPRagrwoEgpjpMRTnkR6vlbznqZs-TCU",
      },
      user: {
        type: "object",
        default: {
          id: "e584adf8-d8e5-43a3-a2be-0d1119a58008",
          username: "user1",
          email: "m@p.com",
        },
      },
    },
  })
  async login(@Body() creds: LoginCredentialsDTO): Promise<LoginResponseDTO> {
    return await this.loginService.login(creds);
  }

  @ApiSecurity("JWT-auth")
  @Post("/refresh_token")
  @successResponse(200, "Success Response.", false, {
    properties: {
      isOk: {
        default: true,
      },
      accessToken: {
        type: "string",
        default:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1AcC5jb20iLCJ1c2VySWQiOiJlNTg0YWRmOC1kOGU1LTQzYTMtYTJiZS0wZDExMTlhNTgwMDgiLCJpYXQiOjE3MzExNTQ4MDZ9.rNFu58By_JYnaGdoIWm5qdbwWCs7cTwkym1KL4t6TLE",
      },
    },
  })
  @UseInterceptors(AuthInterceptor)
  async refreshToken(@Req() request): Promise<RefreshTokenDTO> {
    return await this.loginService.refreshToken(request.headers.authorization);
  }

  @ApiSecurity("JWT-auth")
  @Post("/logout")
  @successResponse(200, "Success Response.", false, {
    properties: {
      isOk: {
        default: true,
      },
      message: {
        type: "string",
        default: "User successfully logged out!.",
      },
    },
  })
  @UseInterceptors(AuthInterceptor)
  async logout(@Req() request): Promise<SuccessResponseDTO> {
    return await this.loginService.logout(request.headers.authorization);
  }

  @ApiSecurity("JWT-auth")
  @Put(":userName/:userRole")
  @UseInterceptors(AuthInterceptor)
  @ApiParam({ name: "userRole", enum: Role })
  @successResponse(200, "Success Response.", false, {
    properties: {
      isOk: {
        default: true,
      },
      message: {
        type: "string",
        default: "User role updated successfully to admin.",
      },
    },
  })
  // only admin can access this api
  async updateUserRole(
    @Req() request,
    @Param("userName") userName: string,
    @Param("userRole") userRole: Role
  ): Promise<SuccessResponseDTO> {
    if (request?.role !== "admin") {
      throw new HttpException(
        MESSAGES.ERROR.USER_NOT_AN_ADMIN,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return await this.loginService.updateUserRole(userName, userRole);
  }
}
