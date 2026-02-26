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
    name: 'ecommerce-api',
    description: 'Ecommerce API',
    version: '1.0.0',
  },
  cors: {
    enabled: true,
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
    enabled: true,
    path: 'docs',
    jsonPath: 'openapi-json',
    yamlPath: 'openapi-yaml',
    foPath: 'docs/fo',
    boPath: 'docs/bo',
    foJsonPath: 'openapi/fo-json',
    boJsonPath: 'openapi/bo-json',
  },
};
