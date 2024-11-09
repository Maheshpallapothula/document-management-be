import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { successResponse } from "./common/swagger/swagger.api.response";
import { GetHelloDTO } from "./common/utils/common.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/health-check")
  @successResponse(200, "Success Response.", false, {
    properties: {
      from: { type: "string", default: "redis-cache" },
      value: { type: "string", default: "Hello From DOCUMENT_DB" },
    },
  })
  async getHello(): Promise<GetHelloDTO> {
    return await this.appService.getHello();
  }
}
