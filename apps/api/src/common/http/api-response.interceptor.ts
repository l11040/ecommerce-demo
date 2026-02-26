import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';

interface ApiSuccessResponse<T> {
  success: true;
  code: string;
  message: string;
  data: T;
}

@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: T) => {
        if (this.isAlreadyWrapped(data)) {
          return data as ApiSuccessResponse<T>;
        }

        const statusCode = response.statusCode;

        return {
          success: true,
          code: statusCode === 201 ? 'COMMON_CREATED' : 'COMMON_OK',
          message: statusCode === 201 ? 'Created' : 'OK',
          data: (data ?? null) as T,
        };
      }),
    );
  }

  private isAlreadyWrapped(value: unknown): boolean {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const target = value as Record<string, unknown>;

    return 'success' in target && 'code' in target && 'message' in target;
  }
}
