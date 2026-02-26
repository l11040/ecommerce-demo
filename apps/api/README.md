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

초기 마이그레이션은 `fo_users`, `bo_admins` 테이블을 생성합니다.

## 4-1) 개발용 seed 데이터 적용 (선택)

```bash
pnpm --filter @ecommerce/api seed:run
```

주의: seed는 운영 마이그레이션 체인과 분리되어 있으며 `migration:run`에는 포함되지 않습니다.

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

로그인 정책:
- FO: `POST /fo/auth/login` (email 기반)
- FO(확장 예정): `POST /fo/auth/social-login` (소셜 로그인 placeholder)
- FO refresh: `POST /fo/auth/refresh`
- BO: `POST /bo/auth/login` (username 기반)
- BO refresh: `POST /bo/auth/refresh`

응답 포맷(전역):
- 성공:
  - `{"success": true, "code": "COMMON_OK", "message": "OK", "data": ...}`
- 실패:
  - `{"success": false, "code": "COMMON_UNAUTHORIZED", "message": "...", "errors": [], "meta": {"requestId": "..."}}`

## 주요 파일 구조

- `src/config/env.loader.ts`: `.env` 로드
- `src/config/env.ts`: 환경변수 파싱/기본값
- `src/config/swagger.config.ts`: Swagger 설정
- `src/common/swagger/*`: 공통 Swagger 스키마/응답 템플릿
- `src/config/typeorm.config.ts`: TypeORM/Nest DB 설정
- `src/database/data-source.ts`: TypeORM CLI DataSource
- `src/database/migrations/*`: 마이그레이션
- `src/database/entities/*`: 엔티티
- `src/modules/**/auth/*.swagger.ts`: 컨트롤러 외부 Swagger 문서 정의
- `src/modules/**/auth/repositories/*`: Repository 패턴 (쿼리 계층)
- `docs/api-documentation-strategy.md`: Swagger/응답 문서화 운영 전략
