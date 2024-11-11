import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import {
  LoginCredentialsDTO,
  LoginResponseDTO,
  RefreshTokenDTO,
  UserDetailsDTO,
} from "./dto/authentication.dto";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MESSAGES } from "src/common/utils/messages";
import { LoggingService } from "src/common/logging/logging.service";
import User from "src/database/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CacheService } from "src/common/caching/cache.service";
import { Role } from "src/common/utils/enums";
import { SuccessResponseDTO } from "src/common/utils/common.dto";

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private log: LoggingService,
    private jwtService: JwtService,
    private config: ConfigService,
    private redis: CacheService
  ) {}

  async login(creds: LoginCredentialsDTO): Promise<LoginResponseDTO> {
    try {
      let { email, password } = creds;
      email = email.trim().toLowerCase();
      password = password.trim();
      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        this.log.error(MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED);
        throw new HttpException(
          MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.UNAUTHORIZED
        );
      }

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid) {
        this.log.error(MESSAGES.ERROR.INVALID_CREDS, HttpStatus.UNAUTHORIZED);
        throw new HttpException(
          MESSAGES.ERROR.INVALID_CREDS,
          HttpStatus.UNAUTHORIZED
        );
      }

      const payload = { email: user.email, userId: user._id };
      const accessToken = await this.jwtService.sign(payload, {
        secret: this.config.get("ACCESS_TOKEN_SECRET"),
      });
      const refreshToken = await this.jwtService.sign(payload, {
        secret: this.config.get("REFRESH_TOKEN_SECRET"),
        expiresIn: this.config.get("REFRESH_EXPIRES_IN"), // 7d Longer lifespan for the refresh token
      });

      const isCacheExists = await this.redis.get(user?._id);

      // Check if the previous cache is exsits then delete the old and set the new cache.
      if (isCacheExists) {
        await this.redis.delete(user?._id);
      }

      await this.redis.set(
        user?._id,
        {
          userId: user?._id,
          accessToken,
          refreshToken,
          email: user?.email,
          role: user?.role,
        },
        this.config.get("REDIS_ACCESS_KEY_EXPIRES_IN")
      );

      return {
        isOk: true,
        accessToken,
        refreshToken,
        user: { _id: user._id, userName: user.username, email: user.email },
      };
    } catch (error) {
      this.log.error(MESSAGES.LOGGING.LOGIN_FAILED, error);
      throw new HttpException(
        error.message ? error.message : MESSAGES.ERROR.LOGIN_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async refreshToken(token: string): Promise<RefreshTokenDTO> {
    try {
      const decoded = this.jwtService.verify(token.slice(7), {
        secret: process.env.REFRESH_TOKEN_SECRET,
      }); // Verify the existing refresh token with its specific secret

      const payload = { email: decoded?.email, userId: decoded?.userId };
      const newAccessToken = await this.jwtService.sign(payload, {
        secret: this.config.get("ACCESS_TOKEN_SECRET"),
      }); // Issue a new access token

      if (newAccessToken) {
        let existedCache = await this.redis.get(decoded?.userId);
        existedCache.accessToken = newAccessToken;
        await this.redis.delete(decoded?.userId);
        await this.redis.set(
          decoded?.userId,
          {
            userId: decoded?.userId,
            accessToken: newAccessToken,
            refreshToken: existedCache?.refreshToken,
            email: existedCache?.email,
            role: existedCache?.role,
          },
          this.config.get("REDIS_ACCESS_KEY_EXPIRES_IN")
        );
      }

      return {
        isOk: true,
        accessToken: newAccessToken,
      };
    } catch (error) {
      this.log.error(MESSAGES.LOGGING.REFRESH_TOKEN_FAILURE, error);
      throw new HttpException(
        MESSAGES.ERROR.INVALID_TOKEN,
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  async logout(token: string): Promise<SuccessResponseDTO> {
    try {
      const decoded = this.jwtService.verify(token.slice(7), {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      const IsCacheExist = await this.redis.get(decoded?.userId);

      if (!IsCacheExist) {
        throw new HttpException(
          MESSAGES.ERROR.INVALID_TOKEN,
          HttpStatus.UNAUTHORIZED
        );
      }

      await this.redis.delete(decoded?.userId);

      return {
        isOk: true,
        message: MESSAGES.ERROR.USER_LOGGED_OUT,
      };
    } catch (error) {
      this.log.error(MESSAGES.ERROR.INVALID_TOKEN, error);
      throw new HttpException(
        MESSAGES.ERROR.INVALID_TOKEN,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async createUser(userDetails: UserDetailsDTO) {
    try {
      let { email = "", password = "", userName = "" } = userDetails;
      email = email.trim().toLowerCase();
      userName = userName.trim().toLowerCase();
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      const userId = uuidv4();

      const isUserNameExist = await this.userRepo.find({
        where: {
          username: userName,
        },
      });

      if (!isUserNameExist) {
        throw new HttpException(
          MESSAGES.ERROR.USER_ALREADY_EXIST,
          HttpStatus.UNAUTHORIZED
        );
      }

      const user = await this.userRepo.create({
        _id: userId,
        username: userName,
        email,
        password: passwordHash,
        salt,
      });

      const result = await this.userRepo.save(user);

      if (result) {
        this.log.log(`${MESSAGES.LOGGING.USER_REGISTRATION_LOGGER}: ${user}`);
        return {
          isOk: true,
          message: MESSAGES.SUCCESS.USER_REGISTRATION_SUCCESS,
        };
      } else {
        this.log.error(
          MESSAGES.ERROR.FAILED_TO_REGISTER_USER,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
        throw new HttpException(
          MESSAGES.ERROR.FAILED_TO_REGISTER_USER,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      this.log.error(MESSAGES.ERROR.FAILED_TO_REGISTER_USER, error);
      throw new HttpException(
        error?.message
          ? error?.message
          : MESSAGES.ERROR.FAILED_TO_REGISTER_USER,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Interceptor request to check user is valid in db and redis
  async tokenValidator(token: string): Promise<User> {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });

      let user: User = await this.userRepo.findOne({
        where: { _id: decoded?.userId },
      });

      const cacheExists = await this.redis.get(decoded?.userId);

      if (!user || !cacheExists) {
        this.log.error(MESSAGES.ERROR.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
        throw new HttpException(
          MESSAGES.ERROR.INVALID_TOKEN,
          HttpStatus.UNAUTHORIZED
        );
      }
      user.role = cacheExists?.role;
      return user;
    } catch (error) {
      this.log.error(error, HttpStatus.INTERNAL_SERVER_ERROR);
      throw new HttpException(
        MESSAGES.ERROR.INVALID_TOKEN,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateUserRole(userName: string, role: Role) {
    try {
      userName = userName.trim().toLowerCase();

      if (!Object.values(Role).includes(role as Role)) {
        throw new HttpException(
          MESSAGES.ERROR.INVALID_ROLE,
          HttpStatus.UNAUTHORIZED
        );
      }

      // Retrieve the user by id
      const user = await this.userRepo.findOne({
        where: { username: userName },
      });

      if (!user) {
        throw new HttpException(
          MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      // Update the user's role
      user.role = role;

      // Save the updated user
      await this.userRepo.save(user);

      this.log.log(
        `${MESSAGES.LOGGING.USER_ROLE_UPDATED}: User ${userName} role updated to ${role}`
      );

      // Automatically user will loggout and role should be updated.
      await this.redis.delete(user?._id);

      return {
        isOk: true,
        message: `User role updated successfully to ${role}`,
      };
    } catch (error) {
      this.log.error(MESSAGES.LOGGING.ERROR_WHILE_UPDATING_USER_ROLE, error);
      throw new HttpException(
        MESSAGES.LOGGING.ERROR_WHILE_UPDATING_USER_ROLE,
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}
