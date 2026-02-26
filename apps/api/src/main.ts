import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env';
import { setupSwagger } from './config/swagger.config';
import { ApiResponseInterceptor } from './common/http/api-response.interceptor';
import { ApiExceptionFilter } from './common/http/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (env.cors.enabled) {
    const allowAll = env.cors.origins.includes('*');

    app.enableCors({
      origin: allowAll ? true : env.cors.origins,
    });
  }

  app.useGlobalInterceptors(new ApiResponseInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());

  setupSwagger(app);
  await app.listen(env.app.port);
}
void bootstrap();
