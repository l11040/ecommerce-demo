import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

interface ApiErrorItem {
  field?: string;
  reason: string;
}

interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
  errors?: ApiErrorItem[];
  meta?: {
    requestId: string;
  };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId =
      (request.headers?.['x-request-id'] as string | undefined) ?? randomUUID();

    const { status, code, message, errors } =
      this.normalizeException(exception);

    const payload: ApiErrorResponse = {
      success: false,
      code,
      message,
      meta: { requestId },
    };

    if (errors.length > 0) {
      payload.errors = errors;
    }

    response.status(status).json(payload);
  }

  private normalizeException(exception: unknown): {
    status: number;
    code: string;
    message: string;
    errors: ApiErrorItem[];
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return {
          status,
          code: this.defaultCode(status),
          message: response,
          errors: [],
        };
      }

      const responseObject = response as {
        code?: string;
        message?: string | string[];
      };

      const message = Array.isArray(responseObject.message)
        ? 'Validation failed'
        : (responseObject.message ?? exception.message);

      const errors = Array.isArray(responseObject.message)
        ? responseObject.message.map((reason) => ({ reason }))
        : [];

      return {
        status,
        code: responseObject.code ?? this.defaultCode(status),
        message,
        errors,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'COMMON_INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      errors: [],
    };
  }

  private defaultCode(status: number): string {
    const httpStatus = status as HttpStatus;

    switch (httpStatus) {
      case HttpStatus.BAD_REQUEST:
        return 'COMMON_BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'COMMON_UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'COMMON_FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'COMMON_NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'COMMON_CONFLICT';
      default:
        return 'COMMON_ERROR';
    }
  }
}
