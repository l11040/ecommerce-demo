# Product Domain Implementation Plan (B2B Promotion Store)

Updated: 2026-03-03  
Status: `권장안 확정본 (v1)`

## 1. 목표

- 스토어 입점형 B2B 판촉물 이커머스의 제품 도메인을 백엔드 우선으로 구축한다.
- FO/BO API를 분리하고, 제품 핵심 정책은 공통 모듈로 공유한다.
- 인쇄 옵션, 수량별 단가/마진, MOQ, 회원/비회원 가격, SEO, HTML 상세를 1차 범위에 포함한다.

## 2. 확정 의사결정 (권장안 적용)

아래 항목은 인터뷰 질문(P01~P30)에 대해 권장안으로 확정했다.

| ID | 확정 내용 |
| --- | --- |
| P01 | 상품은 반드시 1개 스토어에 소속된다. (공용 상품 없음) |
| P02 | BO 권한은 `전체 관리자`와 `스토어 관리자`로 분리한다. |
| P03 | 상품 상태는 `draft`, `published`, `soldout`, `stopped` 4단계로 운영한다. |
| P04 | 상품은 단일 카테고리로 시작한다. |
| P05 | 초기 SKU 전략은 단일 SKU로 시작한다. |
| P06 | 옵션은 `필수/선택` + `단일/다중선택` 2축을 모두 지원한다. |
| P07 | 옵션 가격은 1차에서 정액 추가금 방식으로 운영한다. |
| P08 | 인쇄 옵션은 일반 옵션 모델을 재사용하고 print 메타필드로 보완한다. |
| P09 | 인쇄 메타(가능여부, 방식, 인쇄공간, 시안리드타임)를 표준 필드로 관리한다. |
| P10 | MOQ는 상품 공통값으로 시작한다. |
| P11 | 수량 tier는 `min_qty 기준 누적` 룰로 적용한다. |
| P12 | BO 입력은 마진률% 기준 자동 계산 + 단가 override 허용으로 운영한다. |
| P13 | KRW 반올림은 원단위 반올림으로 고정한다. |
| P14 | 회원/비회원 가격은 독립 tier 테이블로 운영한다. |
| P15 | 회원 세그먼트는 1차에서 `guest/member` 2단계만 지원한다. |
| P16 | VAT 정책은 상품 단위로 관리한다. |
| P17 | FO 표시 정책은 `단가 VAT별도 / 총액 VAT포함`으로 고정한다. |
| P18 | 배송비는 수량 구간별 정책부터 시작한다. (지역/도서산간은 추후) |
| P19 | MOQ 미만은 기본 차단하되 `문의 전환 플래그`를 제공한다. |
| P20 | 1차는 주문생산형으로 간주해 재고관리 기능을 생략한다. |
| P21 | 상세 콘텐츠는 `raw HTML + sanitized HTML` 동시 저장한다. |
| P22 | 상품 미디어는 내부 업로드 URL과 외부 URL을 모두 허용한다. |
| P23 | SEO는 title/description/keywords/canonical/og/robots 전체 지원한다. |
| P24 | 상품 slug는 전역 유니크로 관리한다. |
| P25 | 태그와 유사검색어를 분리 저장한다. |
| P26 | BO 목록 필터는 스토어/상태/카테고리/키워드/노출여부/MOQ 범위를 기본으로 한다. |
| P27 | FO 노출은 `published + is_visible + store_active` 3조건으로 고정한다. |
| P28 | 가격/마진/옵션 변경 감사로그를 저장한다. |
| P29 | 1차에서는 게시 승인 플로우를 도입하지 않는다. |
| P30 | 1차 필수 API 5개를 별도 섹션(8장)에 고정한다. |

## 3. 아키텍처 원칙

- 컨트롤러는 얇게 유지하고 비즈니스 로직은 서비스, 쿼리는 리포지토리로 분리한다.
- Swagger는 컨트롤러 외부 `*.swagger.ts`에서 관리한다.
- 전역 응답 포맷은 `success/code/message/data`를 유지한다.
- 공유 비즈니스 로직(예: 견적 계산, 수량 tier 계산, VAT 계산)은 workspace package로 분리한다.
- 공통 도메인 모듈은 `src/modules/product/*`에 둔다.
- FO/BO API 진입점은 아래처럼 분리한다.
  - `src/modules/fo/products/*`
  - `src/modules/bo/products/*`
- 공유 로직 패키지:
  - `packages/product-domain` (`@ecommerce/product-domain`)

## 4. 도메인 모델

### 4.1 핵심 테이블

1. `stores`
- 입점 스토어 마스터
- 필드 예시: `id`, `name`, `status`, `is_active`

2. `store_admin_permissions`
- BO 계정의 스토어 권한 매핑
- 역할: `super_admin`, `store_admin`

3. `products`
- 상품 기본 정보(SPU)
- 필드 예시:
  - `store_id`, `category_id`, `name`, `slug`, `status`, `is_visible`
  - `moq`, `moq_inquiry_only`
  - `base_supply_cost`
  - `vat_type(exclusive/inclusive)`, `vat_rate`
  - `is_printable`, `print_method`, `print_area`, `proof_lead_time_days`

4. `product_variants`
- 확장 대비 SKU 테이블
- 1차는 기본 1행만 사용

5. `product_media`
- 썸네일/상세 이미지, 정렬, alt
- `source_type(internal/external)`, `url`

6. `product_descriptions`
- `description_html_raw`, `description_html_sanitized`

7. `product_spec_groups`, `product_specs`
- 스펙 테이블(납품기간, 제품크기, 재질, 박스당 택배비 등) 동적 관리

8. `product_option_groups`
- 옵션 그룹(`is_required`, `selection_type(single/multi)`, `sort_order`)

9. `product_option_items`
- 옵션 항목(`label`, `extra_unit_price`, `extra_supply_cost`, `sort_order`)

10. `product_price_tiers`
- 수량별 가격 정책
- 필드 예시:
  - `product_id`, `customer_segment(guest/member)`
  - `min_qty`, `margin_rate`, `unit_price_override`, `computed_unit_price`
  - `is_active`

11. `product_shipping_tiers`
- 수량별 배송비 정책
- 필드 예시: `min_qty`, `shipping_fee`, `is_active`

12. `product_seo_meta`
- `meta_title`, `meta_description`, `meta_keywords`
- `canonical_url`, `robots`, `og_title`, `og_description`, `og_image`

13. `product_tags`
- 검색 태그

14. `product_search_aliases`
- 유사 검색어

15. `product_audit_logs`
- 감사로그(옵션/가격/마진/상태 변경 추적)

### 4.2 제약/인덱스

- `products.slug` 유니크
- `products(store_id, status, is_visible)` 인덱스
- `products(category_id)` 인덱스
- `product_price_tiers(product_id, customer_segment, min_qty)` 유니크 인덱스
- `product_option_groups(product_id, is_required, sort_order)` 인덱스
- `product_option_items(group_id, sort_order)` 인덱스
- `product_shipping_tiers(product_id, min_qty)` 인덱스

## 5. 가격/정책 엔진 규칙

1. MOQ 검증
- 주문 수량 `< moq`이면 기본 차단한다.
- `moq_inquiry_only=true`이면 차단 대신 문의 응답 코드로 전환한다.

2. 수량별 tier 선택
- `min_qty <= 주문수량` 조건을 만족하는 tier 중 가장 큰 `min_qty`를 적용한다.

3. 단가 산출
- 기본 산식: `공급가 * (1 + 마진율)`
- `unit_price_override`가 있으면 override 값을 우선한다.

4. 회원/비회원 분기
- `guest/member` 별 tier를 독립 저장/적용한다.

5. 옵션 추가금 반영
- 선택한 옵션들의 `extra_unit_price`를 상품 단가에 합산한다.

6. 배송비
- 수량 구간 tier로 배송비를 계산한다.

7. VAT
- 상품 단위로 `vat_type`, `vat_rate`를 적용한다.
- 표시 규칙은 `단가 VAT별도 / 총액 VAT포함`으로 고정한다.

8. 반올림
- KRW 원단위 반올림을 공통 규칙으로 적용한다.

## 6. BO API 설계

- `POST /bo/products` 상품 생성
- `PATCH /bo/products/:id` 기본정보 수정
- `PATCH /bo/products/:id/status` 상태 변경
- `PUT /bo/products/:id/specs` 스펙 저장
- `PUT /bo/products/:id/options` 옵션 저장
- `PUT /bo/products/:id/price-tiers` 가격/마진 저장
- `PUT /bo/products/:id/shipping-tiers` 배송비 저장
- `PUT /bo/products/:id/description` 상세 HTML 저장
- `PUT /bo/products/:id/seo` SEO 저장
- `GET /bo/products` 다중 조건 조회
- `GET /bo/products/:id` 상세 조회
- `POST /bo/products/:id/quote-preview` 견적 시뮬레이션

## 7. FO API 설계

- `GET /fo/products` 목록/검색
- `GET /fo/products/:slug` 상세
- `POST /fo/products/:id/quote` 수량+옵션 기반 실시간 견적
- `GET /fo/stores/:storeId/products` 스토어별 상품 목록

FO 노출 조건:
- `product.status = published`
- `product.is_visible = true`
- `store.is_active = true`

## 8. 1차 릴리즈 필수 API 5개 (P30)

1. `POST /bo/products`
2. `PUT /bo/products/:id/options`
3. `PUT /bo/products/:id/price-tiers`
4. `GET /fo/products/:slug`
5. `POST /fo/products/:id/quote`

## 9. Swagger 문서화 규칙

- 모든 엔드포인트는 `*.swagger.ts`로 분리 작성한다.
- 필수 문서화 상태코드:
  - 성공: `200`, `201`
  - 실패: `400`, `401`, `403`, `404`, `409`, `500`
- 공통 응답 스키마와 런타임 응답 포맷을 일치시킨다.

예시 에러 코드:
- `PRODUCT_NOT_FOUND`
- `PRODUCT_INVALID_MOQ`
- `PRODUCT_REQUIRED_OPTION_MISSING`
- `PRODUCT_PRICE_TIER_INVALID`
- `PRODUCT_STORE_FORBIDDEN`
- `PRODUCT_UNPUBLISHED`
- `PRODUCT_INQUIRY_ONLY`

## 10. 권한/보안 정책

- `super_admin`은 전체 스토어 상품에 접근 가능
- `store_admin`은 매핑된 스토어 상품만 접근 가능
- 쓰기 API는 모두 권한 검증 + 감사로그 기록
- FO는 공개 조건 미충족 상품 접근 시 노출하지 않는다.

## 11. 마이그레이션/시드 전략

- 운영 마이그레이션: `src/database/migrations/*`
- 개발 시드: `src/database/seeds/*` (`NODE_ENV=development|local`에서만 허용)
- 시드 데이터 최소 세트:
  - 스토어 1개
  - 상품 2개
  - 옵션/가격 tier/배송 tier/SEO/스펙 데이터

## 12. 구현 로드맵 (백엔드 우선)

1. Phase 1: 스키마/엔티티/마이그레이션
- 제품 도메인 테이블 생성
- 제약/인덱스 적용

2. Phase 2: Repository + Service
- 가격 엔진, MOQ/옵션 검증, 권한 검증, 감사로그 구현

3. Phase 3: BO API + Swagger
- 생성/수정/조회/견적 시뮬레이션

4. Phase 4: FO API + Swagger
- 목록/상세/견적

5. Phase 5: 테스트/안정화
- 단위/통합 테스트
- 성능 점검과 인덱스 튜닝

## 13. 비범위(1차 제외)

- 지역/도서산간 배송비 규칙
- 다중 SKU 재고관리
- 게시 승인 워크플로우
- 회원 등급 다단계 가격 정책
