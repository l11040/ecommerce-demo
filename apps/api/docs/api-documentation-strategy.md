# API Documentation Strategy

## Goal

- Keep controllers thin.
- Keep Swagger documentation complete.
- Document all common error status codes for each endpoint.

## Rules

1. Do not write verbose Swagger decorators directly in controllers.
2. Each endpoint must use a dedicated decorator function from a `*.swagger.ts` file.
3. Every endpoint must document:
   - success response (`200`/`201`)
   - error responses (`400`, `401`, `403`, `404`, `409`, `500`)
4. Use shared response schema builders from `src/common/swagger`.
5. Keep API runtime envelope (`success/code/message/data`) and Swagger schema aligned.

## Folder Convention

- `src/common/swagger/*`: shared schemas/builders
- `src/modules/**/**.swagger.ts`: endpoint-specific docs
- `src/modules/**/repositories/*`: repository layer (query code)
- `src/modules/**/**.service.ts`: business logic layer
