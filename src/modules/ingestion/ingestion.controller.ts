import { Controller, Post, Get } from "@nestjs/common";
import { ApiSecurity } from "@nestjs/swagger";
import { successResponse } from "src/common/swagger/swagger.api.response";

@ApiSecurity("JWT-auth")
@Controller("ingestion")
export class IngestionController {
  @Post("/trigger")
  @successResponse(200, "Success Response.", false, {
    properties: {
      message: { type: "string", default: "Ingestion process initiated." },
    },
  })
  triggerIngestion(): { message: string } {
    // This would ideally call a service method to trigger an external Python process via API/Webhook
    return { message: "Ingestion process initiated." };
  }

  @Get("/status")
  @successResponse(200, "Success Response.", false, {
    properties: {
      status: { type: "string", default: "Currently processing" },
    },
  })
  getIngestionStatus(): { status: string } {
    // This would call a service method to check the status of the ingestion process
    return { status: "Currently processing" };
  }
}
