import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (env.cors.enabled) {
    const allowAll = env.cors.origins.includes('*');

    app.enableCors({
      origin: allowAll ? true : env.cors.origins,
    });
  }

  setupSwagger(app);
  await app.listen(env.app.port);
}
bootstrap();
