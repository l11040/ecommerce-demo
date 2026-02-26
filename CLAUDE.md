# Ecommerce Demo

Turborepo 기반 모노레포 프로젝트. 패키지 간 공유 없이 각 앱이 독립적으로 동작한다.

## 구조

```
apps/
  web/    — 고객용 프론트엔드 (Next.js, Tailwind CSS, shadcn/ui) :40001
  admin/  — 관리자 프론트엔드 (Next.js, Tailwind CSS, shadcn/ui) :40002
  api/    — 백엔드 API (NestJS)                                  :40003
```

## 폴더 구조 (web / admin 공통)

Feature 기반 구조. 기능 단위로 묶고, 각 feature 안에 components, hooks, types 등을 둔다.

```
src/
  app/              # Next.js App Router (라우팅만)
  components/
    ui/             # shadcn 컴포넌트 (자동 생성)
    common/         # 공통 레이아웃, Header 등
  features/
    <feature>/
      components/
      hooks/
      types.ts
  api/              # orval 자동 생성 API 클라이언트 (수정 금지)
  hooks/            # 전역 커스텀 훅
  lib/              # 유틸리티 (cn 등)
  types/            # 전역 타입
```

## 기술 스택

- **패키지 매니저**: pnpm (workspaces)
- **모노레포 도구**: Turborepo
- **web / admin**: Next.js (App Router, src 디렉토리, TypeScript, Tailwind CSS v4, shadcn/ui)
- **api**: NestJS (TypeScript, Jest)

## 명령어

```bash
pnpm dev                          # 전체 앱 동시 실행
pnpm build                        # 전체 빌드
pnpm lint                         # 전체 린트
pnpm --filter @ecommerce/web dev  # 개별 앱 실행
pnpm --filter @ecommerce/api dev
pnpm --filter @ecommerce/admin dev
pnpm --filter @ecommerce/web generate   # web FO API 클라이언트 생성
pnpm --filter @ecommerce/admin generate # admin BO API 클라이언트 생성
```

## 규칙

- 앱 간 패키지 공유 없음. 각 앱은 독립적으로 의존성을 관리한다.
- web/admin에 shadcn 컴포넌트 추가 시 해당 앱 디렉토리에서 `pnpm dlx shadcn@latest add <component>` 실행.
- `components/ui/` 파일은 직접 수정하지 않는다. 커스텀이 필요하면 `components/common/`에 래퍼 컴포넌트를 만들어 사용한다.
- UI 기본 컴포넌트(Button, Input, Dialog 등)는 직접 만들지 않고 반드시 shadcn을 통해 추가한다. (`pnpm dlx shadcn@latest add <component>`)
- API 클라이언트는 orval로 자동 생성한다. `src/api/` 파일은 직접 수정하지 않는다.
  - web → FO spec (`http://localhost:40003/openapi/fo-json`)
  - admin → BO spec (`http://localhost:40003/openapi/bo-json`)
  - API 서버가 실행 중인 상태에서 `pnpm generate` 실행.

## 커밋 규칙

Conventional Commits를 따른다.

```
<type>(<scope>): <subject>
```

### type

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링 (기능 변경 없음)
- `chore`: 빌드, 설정, 의존성 등 코드 외 변경
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `test`: 테스트 추가/수정

### scope

- `web`, `admin`, `api` 또는 생략 (루트/전체 대상)

### 규칙

- subject는 한글로 작성한다.
- 명령형으로 작성한다. ("추가", "수정", "삭제" 등)
- 한 커밋에 하나의 논리적 변경만 포함한다.
- 여러 앱에 걸친 변경은 scope를 생략한다.

### 예시

```
feat(web): 상품 목록 페이지 추가
fix(api): 인증 토큰 만료 처리 수정
chore: eslint 설정 업데이트
docs(admin): CLAUDE.md 규칙 추가
```
