import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuthenticationService } from "src/modules/authentication/authentication.service";
import { MESSAGES } from "./messages";

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(private readonly loginService: AuthenticationService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new HttpException(
        MESSAGES.ERROR.EMPTY_TOKEN,
        HttpStatus.UNAUTHORIZED
      );
    }

    // Ensure the token is extracted correctly assuming 'Bearer ' prefix
    const token = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.slice(7)
      : authorizationHeader;

    try {
      const userData = await this.loginService.tokenValidator(token);
      request.userId = userData._id;
      request.role = userData.role;
      return next.handle();
    } catch (error) {
      throw new HttpException(
        error.message || "Invalid token",
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}
