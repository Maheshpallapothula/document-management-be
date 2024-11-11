import { ApiHeader, ApiResponse } from "@nestjs/swagger";

// Define a reusable success response
export const successResponse = (
  statusCode: number = 200,
  description: string = "Success Response",
  responseType: any,
  schema: any = {}
) => {
  if (responseType) {
    return ApiResponse({
      status: statusCode,
      description: description,
      type: responseType,
    });
  } else {
    return ApiResponse({
      status: statusCode,
      description: description,
      schema: schema,
    });
  }
};

// Define a reusable error response
export const errorResponse = (
  statusCode: number = 400,
  description: string = "Bad request"
) =>
  ApiResponse({
    status: statusCode,
    description: description,
    schema: {
      properties: {
        statusCode: { type: "number" },
        timestamp: { type: "string" },
        message: { type: "string" },
      },
    },
  });
