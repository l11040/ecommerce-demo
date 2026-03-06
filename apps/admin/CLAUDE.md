# Admin (BO) 프론트엔드 규칙

## 단일 책임 원칙 (SRP)

하나의 파일, 하나의 함수, 하나의 컴포넌트는 반드시 **하나의 역할만** 수행한다.

### 컴포넌트

- 컴포넌트는 **UI 렌더링만** 담당한다. 비즈니스 로직을 포함하지 않는다.
- 데이터 페칭, 상태 변환, 유효성 검사 등의 로직은 반드시 **커스텀 훅으로 분리**한다.
- 하나의 컴포넌트 파일에 여러 컴포넌트를 정의하지 않는다.

```
# 금지: 컴포넌트 안에 로직 혼합
function ProductCard({ id }) {
  const [product, setProduct] = useState(null);
  useEffect(() => { fetch(`/api/products/${id}`)... }, []);  // ❌
  const discountedPrice = product?.price * 0.9;               // ❌
  return <div>...</div>;
}

# 올바른 패턴: 로직을 훅으로 분리
function ProductCard({ id }) {
  const { product, discountedPrice } = useProduct(id);  // ✅
  return <div>...</div>;
}
```

### 훅 (Hooks)

- 하나의 훅은 **하나의 관심사만** 처리한다.
- API 호출 훅과 UI 상태 훅을 분리한다.
- feature 내부의 훅은 `features/<feature>/hooks/`에 위치한다.
- 여러 feature에서 사용하는 훅만 `src/hooks/`에 위치한다.

### 페이지 (app/)

- `app/` 디렉토리의 파일은 **라우팅과 레이아웃만** 담당한다.
- 페이지 컴포넌트는 feature 컴포넌트를 조합만 하고, 직접적인 로직을 포함하지 않는다.

## 파일 분리 기준

| 역할 | 위치 | 금지 사항 |
|---|---|---|
| UI 렌더링 | `components/` | 데이터 페칭, 비즈니스 로직 금지 |
| 비즈니스 로직 | `hooks/` | JSX 반환 금지 |
| 타입 정의 | `types.ts` | 로직 포함 금지 |
| API 클라이언트 | `api/` (자동 생성) | 수동 수정 금지 |
| 유틸리티 함수 | `lib/` | 상태, 사이드이펙트 금지 |

## 컴포넌트 규칙

- shadcn `components/ui/` 파일은 직접 수정하지 않는다.
- 커스텀이 필요하면 `components/common/`에 래퍼 컴포넌트를 만든다.
- UI 기본 컴포넌트(Button, Input, Dialog 등)는 직접 만들지 않고 shadcn으로 추가한다.
- 아이콘은 lucide-react를 사용한다. 별도의 아이콘 라이브러리를 추가하지 않는다.

## API 클라이언트 규칙

- `src/api/` 파일은 orval이 자동 생성한다. 절대 수동 수정하지 않는다.
- API 호출은 생성된 클라이언트 함수를 통해서만 한다.
- API 서버가 실행 중인 상태에서 `pnpm generate` 실행.

---

# UI/UX 디자인 시스템

## 디자인 원칙

### 1. 단순성 (Simplicity)
- **불필요한 장식을 최소화**한다.
- 기능에 집중하고, 시각적 노이즈를 줄인다.
- 사용자가 작업에 집중할 수 있도록 깔끔한 인터페이스를 유지한다.

### 2. 일관성 (Consistency)
- **같은 요소는 항상 같은 스타일**로 표현한다.
- 색상, 타이포그래피, 간격, 컴포넌트 스타일을 일관되게 사용한다.
- 예외를 만들지 않는다. 예외가 필요하면 디자인 시스템을 수정한다.

### 3. 계층 구조 (Hierarchy)
- **중요도에 따라 시각적 무게를 다르게** 배치한다.
- 주요 액션은 눈에 띄게, 부차적 액션은 절제되게 표현한다.
- 컨텐츠의 계층을 명확히 하여 스캔 가능성을 높인다.

### 4. 여백의 미학
- **충분한 공간(Whitespace)**을 확보한다.
- 여백은 디자인의 일부다. 빈 공간을 두려워하지 않는다.
- 밀집된 UI보다 호흡할 수 있는 UI가 더 읽기 쉽다.

---

## 색상 시스템

### 주요 색상 (Primary Colors)

```
브랜드 그라데이션: from-cyan-500 to-blue-500
- 주요 액션 버튼
- 활성화된 메뉴 아이템
- 강조가 필요한 아이콘
```

### 중립 색상 (Neutral Colors)

```
텍스트:
- 제목/본문: text-slate-900
- 부제목/설명: text-slate-700
- 보조 텍스트: text-slate-500
- 비활성화: text-slate-400

배경:
- 기본 배경: bg-white
- 섹션 구분: bg-slate-50
- 비활성/구분선: bg-slate-100

보더:
- 기본: border-slate-200
- 약한 강조: border-slate-200/60
- 점선(placeholder): border-dashed border-slate-300
```

### 상태 색상 (Status Colors)

```
성공: green-500, bg-emerald-100, text-emerald-700
경고: amber-500, bg-amber-100, text-amber-700
오류: rose-500, bg-rose-100, text-rose-700
정보: cyan-500, bg-cyan-100, text-cyan-700
```

### ❌ 금지 사항

- **임의의 색상 추가 금지**: 위 팔레트 외의 색상을 사용하지 않는다.
- **하드코딩된 hex 색상 금지**: `#FF5733` 같은 값 대신 Tailwind 색상 사용.
- **과도한 색상 사용 금지**: 한 화면에 3가지 이상의 강조 색상을 사용하지 않는다.

---

## 타이포그래피

### 텍스트 크기

```
대제목 (Page Title): text-lg (18px), font-bold
중제목 (Section Title): text-base (16px), font-semibold
소제목 (Subsection): text-sm (14px), font-semibold
본문 (Body): text-sm (14px), font-normal
보조 (Caption): text-xs (12px), font-normal
힌트 (Hint): text-[11px], font-normal
```

### 폰트 굵기

```
font-bold: 700 - 페이지 제목
font-semibold: 600 - 섹션 제목, 강조
font-medium: 500 - 중요한 라벨
font-normal: 400 - 기본 텍스트
```

### ❌ 금지 사항

- **임의의 폰트 크기 금지**: `text-[15px]` 같은 커스텀 크기 사용하지 않는다.
- **한 문장에 여러 굵기 혼용 금지**: 같은 텍스트 블록 안에서 굵기를 바꾸지 않는다.
- **과도한 대문자 사용 금지**: `uppercase`는 특별한 경우에만 사용한다.

---

## 간격 시스템 (Spacing)

### 일관된 간격 값

```
초밀집: gap-1, space-y-1 (4px)
밀집: gap-2, space-y-2 (8px)
기본: gap-3, space-y-3 (12px)
여유: gap-4, space-y-4 (16px)
넓음: gap-6, space-y-6 (24px)
매우 넓음: gap-8, space-y-8 (32px)
```

### 패딩/마진 규칙

```
카드/섹션 내부 패딩: p-5 (20px) 또는 p-6 (24px)
버튼 패딩: px-3 py-2 (좌우 12px, 상하 8px)
인풋 패딩: px-3 (12px)
리스트 아이템 간격: space-y-2 (8px) 또는 space-y-3 (12px)
```

### ❌ 금지 사항

- **홀수 간격 금지**: `gap-5`, `space-y-7` 같은 값은 사용하지 않는다.
- **픽셀 단위 직접 지정 금지**: `p-[13px]` 같은 커스텀 값 사용하지 않는다.
- **일관성 없는 간격 금지**: 같은 컴포넌트 타입은 항상 같은 간격을 사용한다.

---

## 컴포넌트 스타일 규칙

### 둥근 모서리 (Border Radius)

```
기본 카드/버튼: rounded-lg (8px)
큰 섹션: rounded-xl (12px)
작은 요소(뱃지, 칩): rounded-md (6px)
아이콘 배경: rounded-lg (8px)
원형: rounded-full
```

### ❌ 금지 사항
- `rounded`, `rounded-sm`, `rounded-2xl` 사용 금지. 위 값만 사용.

### 그림자 (Shadow)

```
기본 카드: shadow-sm (미묘한 그림자)
부각 요소: shadow-md (중간 그림자)
플로팅 요소: shadow-lg (큰 그림자)
```

### ❌ 금지 사항
- 그림자를 과도하게 사용하지 않는다.
- 같은 레벨의 요소에는 같은 그림자를 사용한다.
- `shadow-xl`, `shadow-2xl` 사용 금지.

### 아이콘

```
아이콘 크기:
- 작은 아이콘: size-4 (16px)
- 기본 아이콘: size-5 (20px)
- 큰 아이콘: size-6 (24px)
- 섹션 헤더 아이콘: size-10 (40px)

아이콘 색상:
- 일반: text-slate-600
- 활성/강조: text-white (그라데이션 배경 위)
- 비활성: text-slate-300
```

### ❌ 금지 사항
- `size-7`, `size-8`, `size-9` 사용 금지. 위 4가지 크기만 사용.
- 아이콘과 텍스트의 정렬이 맞지 않으면 `items-center` 사용 필수.

---

## 레이아웃 패턴

### 카드 레이아웃

```tsx
✅ 올바른 예: 단일 레벨 카드
<div className="rounded-xl border border-slate-200 bg-white p-6">
  <h3>제목</h3>
  <p>내용</p>
</div>

❌ 잘못된 예: 카드 안에 카드 (이중 카드)
<div className="rounded-xl border border-slate-200 bg-white p-6">
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    ...
  </div>
</div>
```

**규칙:**
- **카드는 최대 1레벨까지만** 사용한다.
- 카드 안에 구분이 필요하면 `border-b`나 배경색 변경으로 처리한다.
- 이중/삼중 카드 구조는 절대 금지.

### 섹션 헤더

```tsx
✅ 올바른 예: 아이콘 + 텍스트 조합
<div className="flex items-center gap-3">
  <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
    <Icon className="size-5" />
  </div>
  <div>
    <h3 className="text-lg font-semibold text-slate-900">제목</h3>
    <p className="text-sm text-slate-500">설명</p>
  </div>
</div>

❌ 잘못된 예: 일관성 없는 스타일
<h3 className="text-sm font-semibold">제목</h3>
```

**규칙:**
- 모든 주요 섹션 헤더는 위 패턴을 따른다.
- 아이콘은 그라데이션 배경 위에 흰색으로 표시.
- 제목과 설명을 함께 제공한다.

### 폼 레이아웃

```tsx
✅ 올바른 예: 라벨 + 인풋 수직 배치
<label className="space-y-1">
  <span className="text-xs font-semibold text-slate-600">라벨</span>
  <input className="h-9 w-full rounded-md border border-slate-300 px-3 text-xs" />
</label>

❌ 잘못된 예: 라벨과 인풋을 같은 줄에 배치
<div className="flex items-center gap-2">
  <span>라벨</span>
  <input />
</div>
```

**규칙:**
- 라벨은 항상 인풋 위에 배치한다.
- `space-y-1`로 라벨과 인풋 사이 간격 통일.
- 인풋 높이는 `h-9` (36px) 또는 `h-10` (40px)만 사용.

### 리스트 아이템

```tsx
✅ 올바른 예: 보더로 구분
<div className="space-y-2">
  {items.map(item => (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      ...
    </div>
  ))}
</div>

❌ 잘못된 예: 그림자로 구분
<div className="space-y-2">
  {items.map(item => (
    <div className="rounded-md shadow-md p-3">
      ...
    </div>
  ))}
</div>
```

**규칙:**
- 리스트 아이템은 `border`로 구분한다.
- `shadow`는 리스트 아이템에 사용하지 않는다.
- 아이템 간 간격은 `space-y-2` 사용.

### 네비게이션 메뉴

```tsx
✅ 올바른 예: 활성/비활성 상태가 명확
<button
  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
    isActive
      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
      : 'text-slate-600 hover:bg-slate-50'
  }`}
>
  <Icon className="size-4" />
  <span>메뉴</span>
</button>

❌ 잘못된 예: 활성 상태가 불명확
<button className="text-cyan-500">메뉴</button>
```

**규칙:**
- 활성 메뉴는 그라데이션 배경 + 흰색 텍스트.
- 비활성 메뉴는 slate-600 텍스트 + hover 시 slate-50 배경.
- 아이콘과 텍스트는 항상 함께 표시한다.

---

## 빈 상태 (Empty State)

```tsx
✅ 올바른 예: 시각적 피드백 제공
<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 py-12">
  <Icon className="mb-3 size-10 text-slate-300" />
  <p className="text-sm font-medium text-slate-500">데이터가 없습니다</p>
  <p className="text-xs text-slate-400">버튼을 클릭하여 추가하세요</p>
</div>

❌ 잘못된 예: 단순 텍스트만 표시
<p className="text-sm text-slate-500">데이터가 없습니다</p>
```

**규칙:**
- 빈 상태는 `border-dashed`를 사용한다.
- 아이콘 + 메시지 + 힌트를 제공한다.
- 중앙 정렬 + 충분한 패딩(py-12)을 유지한다.

---

## 하지 말아야 할 것들 (안티패턴)

### ❌ 카드 중첩 금지

```tsx
// 절대 금지!
<div className="rounded-xl border bg-white p-6">
  <div className="rounded-lg border bg-slate-50 p-4">
    <div className="rounded-md border bg-white p-3">
      컨텐츠
    </div>
  </div>
</div>
```

**이유:** 시각적 복잡도가 증가하고, 계층이 불명확해진다.
**대안:** 단일 레벨 카드 + 보더 또는 배경색으로 구분.

### ❌ 불필요한 보더/그림자 중복 금지

```tsx
// 잘못된 예
<div className="rounded-lg border border-slate-200 shadow-md">
  ...
</div>
```

**이유:** 보더와 그림자를 함께 사용하면 과도하게 강조된다.
**대안:** 둘 중 하나만 선택. 일반적으로 `border`만 사용.

### ❌ 일관성 없는 간격 금지

```tsx
// 잘못된 예: 같은 타입인데 간격이 다름
<div className="space-y-2">...</div>
<div className="space-y-4">...</div>
<div className="space-y-3">...</div>
```

**대안:** 같은 타입의 레이아웃은 항상 같은 간격을 사용.

### ❌ 과도한 색상 사용 금지

```tsx
// 잘못된 예: 한 화면에 너무 많은 색상
<div className="bg-cyan-500">...</div>
<div className="bg-blue-500">...</div>
<div className="bg-purple-500">...</div>
<div className="bg-pink-500">...</div>
```

**대안:** 브랜드 색상(cyan-blue 그라데이션) + 중립 색상(slate)만 사용.

### ❌ 텍스트 크기 난발 금지

```tsx
// 잘못된 예
<h1 className="text-2xl">제목</h1>
<h2 className="text-[17px]">부제목</h2>
<p className="text-[13px]">본문</p>
```

**대안:** 정해진 타이포그래피 시스템 내에서만 선택.

### ❌ 정렬 불일치 금지

```tsx
// 잘못된 예: 아이콘과 텍스트가 정렬되지 않음
<div className="flex gap-2">
  <Icon className="size-5" />
  <span>텍스트</span>
</div>
```

**대안:** `items-center`를 추가하여 수직 정렬.

### ❌ 반응형 무시 금지

```tsx
// 잘못된 예: 모바일에서 깨지는 레이아웃
<div className="grid grid-cols-4 gap-2">...</div>
```

**대안:** 반응형 그리드 사용 `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`.

---

## 체크리스트

새로운 UI를 만들기 전에 다음을 확인하세요:

- [ ] 색상이 정의된 팔레트 내에 있는가?
- [ ] 텍스트 크기가 타이포그래피 시스템을 따르는가?
- [ ] 간격이 일관된 값(2, 3, 4, 6, 8)을 사용하는가?
- [ ] 카드가 중첩되지 않았는가?
- [ ] 보더와 그림자를 함께 사용하지 않았는가?
- [ ] 아이콘과 텍스트가 수직 정렬되어 있는가?
- [ ] 빈 상태에 적절한 피드백이 있는가?
- [ ] 반응형 디자인을 고려했는가?

---

## 참고사항

- Tailwind CSS v4 사용 중이므로 모든 클래스는 Tailwind 문서를 참고한다.
- shadcn/ui 컴포넌트는 이미 디자인 시스템을 따르므로 적극 활용한다.
- 새로운 패턴이 필요하면 이 문서를 먼저 업데이트한 후 코드에 반영한다.
