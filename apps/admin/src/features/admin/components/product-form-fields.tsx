'use client';

import {
  BoQuotePreviewDtoCustomerSegment,
  CreateProductDtoStatus,
  CreateProductDtoVatType,
  type CreateProductDto,
  type List200DataItem,
  type ListProducts200DataItem,
  type UpdateProductDto,
} from '@/api/bo';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── 타입 ──

export type ProductStatus = (typeof CreateProductDtoStatus)[keyof typeof CreateProductDtoStatus];
export type ProductVatType = (typeof CreateProductDtoVatType)[keyof typeof CreateProductDtoVatType];
export type QuoteSegment =
  (typeof BoQuotePreviewDtoCustomerSegment)[keyof typeof BoQuotePreviewDtoCustomerSegment];

export type ProductFormState = {
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  status: ProductStatus;
  isVisible: boolean;
  moq: string;
  moqInquiryOnly: boolean;
  baseSupplyCost: string;
  vatType: ProductVatType;
  vatRate: string;
  isPrintable: boolean;
  printMethod: string;
  printArea: string;
  proofLeadTimeDays: string;
  thumbnailUrl: string;
};

export type SeoFormState = {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
};

export type QuoteFormState = {
  quantity: string;
  customerSegment: QuoteSegment;
  selectedOptionItemIdsCsv: string;
};

// ── 상수 ──

export const noneValue = '__none__';

export const defaultProductFormState: ProductFormState = {
  storeId: '1',
  categoryId: '',
  name: '',
  slug: '',
  status: CreateProductDtoStatus.draft,
  isVisible: false,
  moq: '1',
  moqInquiryOnly: false,
  baseSupplyCost: '0',
  vatType: CreateProductDtoVatType.exclusive,
  vatRate: '10',
  isPrintable: false,
  printMethod: '',
  printArea: '',
  proofLeadTimeDays: '',
  thumbnailUrl: '',
};

export const defaultSeoFormState: SeoFormState = {
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  canonicalUrl: '',
  robots: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
};

export const defaultQuoteFormState: QuoteFormState = {
  quantity: '30',
  customerSegment: BoQuotePreviewDtoCustomerSegment.guest,
  selectedOptionItemIdsCsv: '',
};

// ── 유틸 ──

export function toNullableString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

export function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '-';
  const parsed = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(parsed)) return '-';
  return parsed.toLocaleString('ko-KR');
}

export function statusLabel(status: string): string {
  if (status === 'draft') return '임시저장';
  if (status === 'published') return '게시중';
  if (status === 'soldout') return '품절';
  if (status === 'stopped') return '중지';
  return status;
}

export function statusBadgeClass(status: string): string {
  if (status === 'published') return 'bg-emerald-100 text-emerald-700';
  if (status === 'draft') return 'bg-slate-100 text-slate-700';
  if (status === 'soldout') return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
}

export function buildUpdatePayload(state: ProductFormState): UpdateProductDto {
  return {
    categoryId: state.categoryId === noneValue || state.categoryId === '' ? null : Number(state.categoryId),
    name: state.name.trim(),
    slug: state.slug.trim(),
    status: state.status,
    isVisible: state.isVisible,
    moq: Number(state.moq || '1'),
    moqInquiryOnly: state.moqInquiryOnly,
    baseSupplyCost: Number(state.baseSupplyCost || '0'),
    vatType: state.vatType,
    vatRate: Number(state.vatRate || '10'),
    isPrintable: state.isPrintable,
    printMethod: toNullableString(state.printMethod),
    printArea: toNullableString(state.printArea),
    proofLeadTimeDays: parseOptionalNumber(state.proofLeadTimeDays) ?? null,
    thumbnailUrl: toNullableString(state.thumbnailUrl),
  };
}

export function buildCreatePayload(state: ProductFormState): CreateProductDto {
  return {
    storeId: Number(state.storeId),
    ...buildUpdatePayload(state),
    name: state.name.trim(),
    slug: state.slug.trim(),
  };
}

export function toProductFormState(product: ListProducts200DataItem): ProductFormState {
  return {
    storeId: String(product.storeId),
    categoryId: product.categoryId === null ? noneValue : String(product.categoryId),
    name: product.name,
    slug: product.slug,
    status:
      product.status === CreateProductDtoStatus.published ||
      product.status === CreateProductDtoStatus.soldout ||
      product.status === CreateProductDtoStatus.stopped
        ? product.status
        : CreateProductDtoStatus.draft,
    isVisible: product.isVisible,
    moq: String(product.moq),
    moqInquiryOnly: product.moqInquiryOnly,
    baseSupplyCost: String(product.baseSupplyCost),
    vatType:
      product.vatType === CreateProductDtoVatType.inclusive
        ? CreateProductDtoVatType.inclusive
        : CreateProductDtoVatType.exclusive,
    vatRate: String(product.vatRate),
    isPrintable: product.isPrintable,
    printMethod: product.printMethod ?? '',
    printArea: product.printArea ?? '',
    proofLeadTimeDays: product.proofLeadTimeDays === null ? '' : String(product.proofLeadTimeDays),
    thumbnailUrl: product.thumbnailUrl ?? '',
  };
}

export function readObjectString(value: unknown, key: string): string {
  if (!value || typeof value !== 'object') return '';
  const raw = (value as Record<string, unknown>)[key];
  return typeof raw === 'string' ? raw : '';
}

// ── 폼 컴포넌트 ──

export function ProductFormFields({
  formState,
  onChange,
  categories,
  onUploadThumbnail,
  isUploadingThumbnail = false,
  disableStoreId = false,
}: {
  formState: ProductFormState;
  onChange: React.Dispatch<React.SetStateAction<ProductFormState>>;
  categories: List200DataItem[];
  onUploadThumbnail?: (file: File) => void | Promise<void>;
  isUploadingThumbnail?: boolean;
  disableStoreId?: boolean;
}) {
  return (
    <>
      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">스토어 ID</span>
        <input
          type="number"
          min={1}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.storeId}
          onChange={(event) => onChange((prev) => ({ ...prev, storeId: event.target.value }))}
          disabled={disableStoreId}
          required
        />
        {disableStoreId ? (
          <p className="text-[11px] text-slate-500">수정 모드에서는 스토어 ID를 변경할 수 없습니다.</p>
        ) : null}
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">카테고리</span>
        <Select
          value={formState.categoryId || noneValue}
          onValueChange={(value) =>
            onChange((prev) => ({
              ...prev,
              categoryId: value === noneValue ? noneValue : value,
            }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리 없음" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={noneValue}>카테고리 없음</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                [{category.depth}] {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">상품명</span>
        <input
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.name}
          onChange={(event) => onChange((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">슬러그</span>
        <input
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.slug}
          onChange={(event) => onChange((prev) => ({ ...prev, slug: event.target.value }))}
          required
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">상태</span>
        <Select
          value={formState.status}
          onValueChange={(value) => onChange((prev) => ({ ...prev, status: value as ProductStatus }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CreateProductDtoStatus.draft}>임시저장</SelectItem>
            <SelectItem value={CreateProductDtoStatus.published}>게시중</SelectItem>
            <SelectItem value={CreateProductDtoStatus.soldout}>품절</SelectItem>
            <SelectItem value={CreateProductDtoStatus.stopped}>중지</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">VAT 유형</span>
        <Select
          value={formState.vatType}
          onValueChange={(value) => onChange((prev) => ({ ...prev, vatType: value as ProductVatType }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CreateProductDtoVatType.exclusive}>VAT 별도</SelectItem>
            <SelectItem value={CreateProductDtoVatType.inclusive}>VAT 포함</SelectItem>
          </SelectContent>
        </Select>
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">MOQ</span>
        <input
          type="number"
          min={1}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.moq}
          onChange={(event) => onChange((prev) => ({ ...prev, moq: event.target.value }))}
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">기본 공급가</span>
        <input
          type="number"
          min={0}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.baseSupplyCost}
          onChange={(event) => onChange((prev) => ({ ...prev, baseSupplyCost: event.target.value }))}
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">VAT 비율(%)</span>
        <input
          type="number"
          min={0}
          max={100}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.vatRate}
          onChange={(event) => onChange((prev) => ({ ...prev, vatRate: event.target.value }))}
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">인쇄 방식</span>
        <input
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.printMethod}
          onChange={(event) => onChange((prev) => ({ ...prev, printMethod: event.target.value }))}
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">인쇄 영역</span>
        <input
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.printArea}
          onChange={(event) => onChange((prev) => ({ ...prev, printArea: event.target.value }))}
        />
      </label>

      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-500">시안 리드타임(일)</span>
        <input
          type="number"
          min={0}
          className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.proofLeadTimeDays}
          onChange={(event) => onChange((prev) => ({ ...prev, proofLeadTimeDays: event.target.value }))}
        />
      </label>

      <div className="space-y-2 md:col-span-2">
        <span className="text-xs font-semibold text-slate-500">썸네일 이미지</span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="h-10 min-w-[280px] flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-600"
            value={formState.thumbnailUrl}
            readOnly
            placeholder="업로드 후 경로가 자동 입력됩니다."
          />
          <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">
            {isUploadingThumbnail ? '업로드 중...' : '이미지 업로드'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!onUploadThumbnail || isUploadingThumbnail}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file && onUploadThumbnail) {
                  void onUploadThumbnail(file);
                }
                event.currentTarget.value = '';
              }}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm md:col-span-2">
        <label className="flex items-center gap-2 text-slate-700">
          <Checkbox
            checked={formState.isVisible}
            onCheckedChange={(checked) => onChange((prev) => ({ ...prev, isVisible: checked === true }))}
          />
          노출
        </label>

        <label className="flex items-center gap-2 text-slate-700">
          <Checkbox
            checked={formState.moqInquiryOnly}
            onCheckedChange={(checked) => onChange((prev) => ({ ...prev, moqInquiryOnly: checked === true }))}
          />
          MOQ 미만 문의전환
        </label>

        <label className="flex items-center gap-2 text-slate-700">
          <Checkbox
            checked={formState.isPrintable}
            onCheckedChange={(checked) => onChange((prev) => ({ ...prev, isPrintable: checked === true }))}
          />
          인쇄 가능
        </label>
      </div>
    </>
  );
}

export function SeoFormFields({
  formState,
  onChange,
  onUploadOgImage,
  isUploadingOgImage = false,
}: {
  formState: SeoFormState;
  onChange: React.Dispatch<React.SetStateAction<SeoFormState>>;
  onUploadOgImage?: (file: File) => void | Promise<void>;
  isUploadingOgImage?: boolean;
}) {
  return (
    <div className="grid gap-3">
      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-600">Meta Title</span>
        <input
          className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.metaTitle}
          onChange={(event) => onChange((prev) => ({ ...prev, metaTitle: event.target.value }))}
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-600">Meta Description</span>
        <textarea
          className="min-h-[76px] w-full rounded-md border border-slate-300 p-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.metaDescription}
          onChange={(event) => onChange((prev) => ({ ...prev, metaDescription: event.target.value }))}
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-600">Meta Keywords</span>
        <input
          className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.metaKeywords}
          onChange={(event) => onChange((prev) => ({ ...prev, metaKeywords: event.target.value }))}
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-600">Canonical URL</span>
        <input
          className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.canonicalUrl}
          onChange={(event) => onChange((prev) => ({ ...prev, canonicalUrl: event.target.value }))}
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-600">Robots</span>
        <input
          className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.robots}
          onChange={(event) => onChange((prev) => ({ ...prev, robots: event.target.value }))}
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-600">OG Title</span>
        <input
          className="h-9 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.ogTitle}
          onChange={(event) => onChange((prev) => ({ ...prev, ogTitle: event.target.value }))}
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-600">OG Description</span>
        <textarea
          className="min-h-[76px] w-full rounded-md border border-slate-300 p-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          value={formState.ogDescription}
          onChange={(event) => onChange((prev) => ({ ...prev, ogDescription: event.target.value }))}
        />
      </label>
      <label className="space-y-1">
        <span className="text-xs font-semibold text-slate-600">OG Image</span>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="h-9 min-w-[220px] flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-600"
            value={formState.ogImage}
            readOnly
            placeholder="업로드 후 경로가 자동 입력됩니다."
          />
          <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">
            {isUploadingOgImage ? '업로드 중...' : '이미지 업로드'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!onUploadOgImage || isUploadingOgImage}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file && onUploadOgImage) {
                  void onUploadOgImage(file);
                }
                event.currentTarget.value = '';
              }}
            />
          </label>
        </div>
      </label>
    </div>
  );
}
