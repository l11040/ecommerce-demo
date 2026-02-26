import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from './env';
import { FoModule } from '../modules/fo/fo.module';
import { BoModule } from '../modules/bo/bo.module';

export function setupSwagger(app: INestApplication): void {
  if (!env.swagger.enabled) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle(env.app.name)
    .setDescription(env.app.description)
    .setVersion(env.app.version)
    .addBearerAuth()
    .addCookieAuth(
      'fo_access_token',
      { type: 'apiKey', in: 'cookie' },
      'fo_access_token',
    )
    .addCookieAuth(
      'fo_refresh_token',
      { type: 'apiKey', in: 'cookie' },
      'fo_refresh_token',
    )
    .addCookieAuth(
      'bo_access_token',
      { type: 'apiKey', in: 'cookie' },
      'bo_access_token',
    )
    .addCookieAuth(
      'bo_refresh_token',
      { type: 'apiKey', in: 'cookie' },
      'bo_refresh_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_controllerKey, methodKey) => methodKey,
  });

  SwaggerModule.setup(env.swagger.path, app, document, {
    jsonDocumentUrl: env.swagger.jsonPath,
    yamlDocumentUrl: env.swagger.yamlPath,
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const foDocument = SwaggerModule.createDocument(app, config, {
    include: [FoModule],
    operationIdFactory: (_controllerKey, methodKey) => methodKey,
  });
  SwaggerModule.setup(env.swagger.foPath, app, foDocument, {
    jsonDocumentUrl: env.swagger.foJsonPath,
  });

  const boDocument = SwaggerModule.createDocument(app, config, {
    include: [BoModule],
    operationIdFactory: (_controllerKey, methodKey) => methodKey,
  });
  SwaggerModule.setup(env.swagger.boPath, app, boDocument, {
    jsonDocumentUrl: env.swagger.boJsonPath,
  });
}
