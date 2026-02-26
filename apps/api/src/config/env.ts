import { loadEnv } from './env.loader';

loadEnv();

function getNumber(name: string, defaultValue: number): number {
  const raw = process.env[name];

  if (!raw) {
    return defaultValue;
  }

  const parsed = Number(raw);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric env: ${name}`);
  }

  return parsed;
}

function getString(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

function getBoolean(name: string, defaultValue: boolean): boolean {
  const raw = process.env[name];

  if (!raw) {
    return defaultValue;
  }

  return raw.toLowerCase() === 'true';
}

function getStringArray(name: string, defaultValue: string[]): string[] {
  const raw = process.env[name];

  if (!raw) {
    return defaultValue;
  }

  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export const env = {
  app: {
    port: getNumber('PORT', 40003),
    name: getString('APP_NAME', 'ecommerce-api'),
    description: getString('APP_DESCRIPTION', 'Ecommerce API'),
    version: getString('APP_VERSION', '1.0.0'),
  },
  cors: {
    enabled: getBoolean('CORS_ENABLED', true),
    origins: getStringArray('CORS_ORIGINS', ['*']),
  },
  database: {
    host: getString('DB_HOST', '127.0.0.1'),
    port: getNumber('DB_PORT', 3309),
    username: getString('DB_USER', 'ecommerce'),
    password: getString('DB_PASSWORD', 'ecommerce'),
    name: getString('DB_NAME', 'ecommerce_demo'),
  },
  swagger: {
    enabled: getBoolean('SWAGGER_ENABLED', true),
    path: getString('SWAGGER_PATH', 'docs'),
    jsonPath: getString('SWAGGER_JSON_PATH', 'openapi-json'),
    yamlPath: getString('SWAGGER_YAML_PATH', 'openapi-yaml'),
    foPath: getString('SWAGGER_FO_PATH', 'docs/fo'),
    boPath: getString('SWAGGER_BO_PATH', 'docs/bo'),
    foJsonPath: getString('SWAGGER_FO_JSON_PATH', 'openapi/fo-json'),
    boJsonPath: getString('SWAGGER_BO_JSON_PATH', 'openapi/bo-json'),
  },
};
