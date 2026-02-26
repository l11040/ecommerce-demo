# API (NestJS + MySQL)

## 1) 환경변수 준비

프로젝트 루트에서:

```bash
cp .env.example .env
```

기본 DB 포트는 `3309`입니다.

## 2) 로컬 MySQL 실행 (Docker)

프로젝트 루트에서:

```bash
docker compose up -d mysql
```

## 3) 의존성 설치

```bash
pnpm install
```

## 4) 마이그레이션 실행

```bash
pnpm --filter @ecommerce/api migration:run
```

초기 마이그레이션은 `users` 테이블을 생성합니다.

## 5) API 실행

```bash
pnpm --filter @ecommerce/api dev
```

Swagger UI: `http://localhost:40003/docs`
OpenAPI JSON: `http://localhost:40003/openapi-json`
OpenAPI YAML: `http://localhost:40003/openapi-yaml`
FO Swagger UI: `http://localhost:40003/docs/fo`
FO OpenAPI JSON: `http://localhost:40003/openapi/fo-json`
BO Swagger UI: `http://localhost:40003/docs/bo`
BO OpenAPI JSON: `http://localhost:40003/openapi/bo-json`

웹에서 OpenAPI Generator를 사용할 때는 JSON URL(`openapi-json`)을 입력하면 됩니다.
FO/BO 분리 생성 시에는 각 JSON URL을 사용하면 됩니다.

## 주요 파일 구조

- `src/config/env.loader.ts`: `.env` 로드
- `src/config/env.ts`: 환경변수 파싱/기본값
- `src/config/swagger.config.ts`: Swagger 설정
- `src/config/typeorm.config.ts`: TypeORM/Nest DB 설정
- `src/database/data-source.ts`: TypeORM CLI DataSource
- `src/database/migrations/*`: 마이그레이션
- `src/database/entities/*`: 엔티티
