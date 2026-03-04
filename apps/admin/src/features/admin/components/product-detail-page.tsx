'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
  BoQuotePreviewDtoCustomerSegment,
  detailProduct,
  quotePreviewProduct,
  replaceProductMedia,
  replaceProductOptions,
  replaceProductPriceTiers,
  replaceProductSearchAliases,
  replaceProductShippingTiers,
  replaceProductSpecs,
  replaceProductTags,
  upsertProductDescription,
  upsertProductSeo,
  type ReplaceProductOptionsDto,
  type ReplaceProductPriceTiersDto,
  type ReplaceProductMediaItemDto,
  type ReplaceProductShippingTiersDto,
  type ReplaceProductSpecsDto,
  type QuotePreviewProduct200Data,
} from '@/api/bo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api-response';
import { uploadProductImageFile } from '@/lib/upload';
import { HtmlEditor } from '@/components/common/html-editor';
import { toast } from 'sonner';
import {
  defaultQuoteFormState,
  defaultSeoFormState,
  formatNumber,
  readObjectString,
  SeoFormFields,
  toNullableString,
  type QuoteFormState,
  type QuoteSegment,
  type SeoFormState,
} from './product-form-fields';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductDetailPageProps {
  productId: number;
}

type ProductMediaState = {
  type: NonNullable<ReplaceProductMediaItemDto['type']>;
  sourceType: NonNullable<ReplaceProductMediaItemDto['sourceType']>;
  url: string;
  altText: string;
  sortOrder: string;
};

type PriceTierFormRow = {
  minQty: string;
  marginRate: string;
  unitPriceOverride: string;
  isActive: boolean;
};

type ShippingTierFormRow = {
  minQty: string;
  shippingFee: string;
  isActive: boolean;
};

export function ProductDetailPage({ productId }: ProductDetailPageProps) {
  const [loading, setLoading] = useState(true);
  const [rawJson, setRawJson] = useState('');
  const [productName, setProductName] = useState('');

  // Description
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [descriptionPending, setDescriptionPending] = useState(false);

  // SEO
  const [seoForm, setSeoForm] = useState<SeoFormState>(defaultSeoFormState);
  const [seoPending, setSeoPending] = useState(false);
  const [ogImageUploading, setOgImageUploading] = useState(false);

  // Media / tags / aliases
  const [mediaItems, setMediaItems] = useState<ProductMediaState[]>([]);
  const [mediaPending, setMediaPending] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [tagsText, setTagsText] = useState('');
  const [tagsPending, setTagsPending] = useState(false);
  const [aliasesText, setAliasesText] = useState('');
  const [aliasesPending, setAliasesPending] = useState(false);

  // Option / tier / spec / shipping
  const [optionsJson, setOptionsJson] = useState('[]');
  const [priceTierRows, setPriceTierRows] = useState<{
    guest: PriceTierFormRow[];
    member: PriceTierFormRow[];
  }>({
    guest: [],
    member: [],
  });
  const [specsJson, setSpecsJson] = useState('[]');
  const [shippingTierRows, setShippingTierRows] = useState<ShippingTierFormRow[]>(
    [],
  );
  const [optionsPending, setOptionsPending] = useState(false);
  const [priceTiersPending, setPriceTiersPending] = useState(false);
  const [specsPending, setSpecsPending] = useState(false);
  const [shippingPending, setShippingPending] = useState(false);

  // Quote
  const [quoteForm, setQuoteForm] = useState<QuoteFormState>(defaultQuoteFormState);
  const [quotePending, setQuotePending] = useState(false);
  const [quoteResult, setQuoteResult] = useState<QuotePreviewProduct200Data | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);

    const response = await detailProduct(productId);
    if (response.status !== 200 || !response.data.success) {
      toast.error('상품 상세 조회 실패', {
        description: getApiErrorMessage(response, '상품 상세를 불러오지 못했습니다.'),
      });
      setLoading(false);
      return;
    }

    const detail = response.data.data;
    const detailRecord = detail as Record<string, unknown>;
    setProductName(typeof detail.name === 'string' ? detail.name : `상품 #${productId}`);
    setRawJson(JSON.stringify(detail, null, 2));
    setDescriptionHtml(typeof detail.descriptionHtml === 'string' ? detail.descriptionHtml : '');
    setOptionsJson(JSON.stringify(Array.isArray(detail.optionGroups) ? detail.optionGroups : [], null, 2));
    const tierSource =
      detail.priceTiers && typeof detail.priceTiers === 'object'
        ? (detail.priceTiers as Record<string, unknown>)
        : { guest: [], member: [] };
    const toTierRows = (value: unknown): PriceTierFormRow[] => {
      if (!Array.isArray(value)) {
        return [];
      }

      return value.map((item) => {
        const source = (item ?? {}) as Record<string, unknown>;
        const unitPriceOverrideValue = source.unitPriceOverride;
        return {
          minQty: String(typeof source.minQty === 'number' ? source.minQty : 1),
          marginRate: String(
            typeof source.marginRate === 'number' ? source.marginRate : 0,
          ),
          unitPriceOverride:
            typeof unitPriceOverrideValue === 'number'
              ? String(unitPriceOverrideValue)
              : '',
          isActive:
            typeof source.isActive === 'boolean' ? source.isActive : true,
        };
      });
    };
    setPriceTierRows({
      guest: toTierRows(tierSource.guest),
      member: toTierRows(tierSource.member),
    });
    setSpecsJson(JSON.stringify(Array.isArray(detail.specGroups) ? detail.specGroups : [], null, 2));
    setShippingTierRows(
      Array.isArray(detailRecord.shippingTiers)
        ? detailRecord.shippingTiers.map((item) => {
            const source = (item ?? {}) as Record<string, unknown>;
            return {
              minQty: String(
                typeof source.minQty === 'number' ? source.minQty : 1,
              ),
              shippingFee: String(
                typeof source.shippingFee === 'number' ? source.shippingFee : 0,
              ),
              isActive:
                typeof source.isActive === 'boolean' ? source.isActive : true,
            };
          })
        : [],
    );
    setSeoForm({
      metaTitle: readObjectString(detail.seo, 'metaTitle'),
      metaDescription: readObjectString(detail.seo, 'metaDescription'),
      metaKeywords: readObjectString(detail.seo, 'metaKeywords'),
      canonicalUrl: readObjectString(detail.seo, 'canonicalUrl'),
      robots: readObjectString(detail.seo, 'robots'),
      ogTitle: readObjectString(detail.seo, 'ogTitle'),
      ogDescription: readObjectString(detail.seo, 'ogDescription'),
      ogImage: readObjectString(detail.seo, 'ogImage'),
    });
    setMediaItems(
      (Array.isArray(detailRecord.media) ? detailRecord.media : []).map((item, index) => {
        const source = (item ?? {}) as Record<string, unknown>;
        return {
          type:
            source.type === 'video' || source.type === 'file' ? source.type : 'image',
          sourceType: source.sourceType === 'external' ? 'external' : 'internal',
          url: typeof source.url === 'string' ? source.url : '',
          altText: typeof source.altText === 'string' ? source.altText : '',
          sortOrder: String(
            typeof source.sortOrder === 'number' ? source.sortOrder : index,
          ),
        };
      }),
    );
    setTagsText(
      Array.isArray(detail.tags)
        ? detail.tags.filter((tag): tag is string => typeof tag === 'string').join(', ')
        : '',
    );
    setAliasesText(
      Array.isArray(detail.searchAliases)
        ? detail.searchAliases
            .filter((alias): alias is string => typeof alias === 'string')
            .join(', ')
        : '',
    );

    if (typeof detail.moq === 'number') {
      setQuoteForm((prev) => ({ ...prev, quantity: String(detail.moq) }));
    }

    setLoading(false);
  }, [productId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  async function handleSaveDescription() {
    setDescriptionPending(true);

    const response = await upsertProductDescription(productId, {
      descriptionHtmlRaw: descriptionHtml,
      descriptionHtmlSanitized: descriptionHtml,
    });

    if (response.status !== 200 || !response.data.success) {
      toast.error('상세 HTML 저장 실패', {
        description: getApiErrorMessage(response, '상세 HTML 저장에 실패했습니다.'),
      });
      setDescriptionPending(false);
      return;
    }

    toast.success('상세 HTML 저장 완료');
    setDescriptionPending(false);
  }

  async function handleSaveSeo() {
    setSeoPending(true);

    const response = await upsertProductSeo(productId, {
      metaTitle: toNullableString(seoForm.metaTitle),
      metaDescription: toNullableString(seoForm.metaDescription),
      metaKeywords: toNullableString(seoForm.metaKeywords),
      canonicalUrl: toNullableString(seoForm.canonicalUrl),
      robots: toNullableString(seoForm.robots),
      ogTitle: toNullableString(seoForm.ogTitle),
      ogDescription: toNullableString(seoForm.ogDescription),
      ogImage: toNullableString(seoForm.ogImage),
    });

    if (response.status !== 200 || !response.data.success) {
      toast.error('SEO 저장 실패', {
        description: getApiErrorMessage(response, 'SEO 저장에 실패했습니다.'),
      });
      setSeoPending(false);
      return;
    }

    toast.success('SEO 저장 완료');
    setSeoPending(false);
  }

  async function handleUploadOgImage(file: File) {
    setOgImageUploading(true);

    try {
      const uploaded = await uploadProductImageFile(file);
      setSeoForm((prev) => ({ ...prev, ogImage: uploaded.path }));
      toast.success('OG 이미지 업로드 완료');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
      toast.error('OG 이미지 업로드 실패', { description: message });
    } finally {
      setOgImageUploading(false);
    }
  }

  function parseCsvOrNewline(input: string) {
    return input
      .split(/[\n,]/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }

  function addPriceTierRow(segment: 'guest' | 'member') {
    setPriceTierRows((prev) => ({
      ...prev,
      [segment]: [
        ...prev[segment],
        {
          minQty: '1',
          marginRate: '0',
          unitPriceOverride: '',
          isActive: true,
        },
      ],
    }));
  }

  function removePriceTierRow(segment: 'guest' | 'member', index: number) {
    setPriceTierRows((prev) => ({
      ...prev,
      [segment]: prev[segment].filter((_, rowIndex) => rowIndex !== index),
    }));
  }

  function updatePriceTierRow(
    segment: 'guest' | 'member',
    index: number,
    patch: Partial<PriceTierFormRow>,
  ) {
    setPriceTierRows((prev) => ({
      ...prev,
      [segment]: prev[segment].map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    }));
  }

  function addShippingTierRow() {
    setShippingTierRows((prev) => [
      ...prev,
      {
        minQty: '1',
        shippingFee: '0',
        isActive: true,
      },
    ]);
  }

  function removeShippingTierRow(index: number) {
    setShippingTierRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  }

  function updateShippingTierRow(index: number, patch: Partial<ShippingTierFormRow>) {
    setShippingTierRows((prev) =>
      prev.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  async function handleUploadMedia(file: File) {
    setMediaUploading(true);

    try {
      const uploaded = await uploadProductImageFile(file);
      setMediaItems((prev) => [
        ...prev,
        {
          type: 'image',
          sourceType: 'internal',
          url: uploaded.path,
          altText: '',
          sortOrder: String(prev.length),
        },
      ]);
      toast.success('상품 이미지 업로드 완료');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
      toast.error('상품 이미지 업로드 실패', { description: message });
    } finally {
      setMediaUploading(false);
    }
  }

  async function handleSaveMedia() {
    const media: ReplaceProductMediaItemDto[] = mediaItems.map((item, index) => ({
      type: item.type,
      sourceType: item.sourceType,
      url: item.url.trim(),
      altText: item.altText.trim().length > 0 ? item.altText.trim() : null,
      sortOrder: Number(item.sortOrder || index),
    }));

    if (media.some((item) => item.url.length === 0)) {
      toast.error('미디어 저장 실패', {
        description: '미디어 경로가 비어있는 항목이 있습니다.',
      });
      return;
    }

    setMediaPending(true);
    const response = await replaceProductMedia(productId, { media });

    if (response.status !== 200 || response.data.success !== true) {
      toast.error('미디어 저장 실패', {
        description: getApiErrorMessage(response, '미디어 저장에 실패했습니다.'),
      });
      setMediaPending(false);
      return;
    }

    toast.success('상품 미디어 저장 완료');
    setMediaPending(false);
    await loadDetail();
  }

  async function handleSaveTags() {
    const tags = parseCsvOrNewline(tagsText).map((tag, index) => ({
      tag,
      sortOrder: index,
    }));

    setTagsPending(true);
    const response = await replaceProductTags(productId, { tags });

    if (response.status !== 200 || response.data.success !== true) {
      toast.error('태그 저장 실패', {
        description: getApiErrorMessage(response, '태그 저장에 실패했습니다.'),
      });
      setTagsPending(false);
      return;
    }

    toast.success('태그 저장 완료');
    setTagsPending(false);
    await loadDetail();
  }

  async function handleSaveAliases() {
    const aliases = parseCsvOrNewline(aliasesText).map((aliasText, index) => ({
      aliasText,
      sortOrder: index,
    }));

    setAliasesPending(true);
    const response = await replaceProductSearchAliases(productId, { aliases });

    if (response.status !== 200 || response.data.success !== true) {
      toast.error('검색 별칭 저장 실패', {
        description: getApiErrorMessage(response, '검색 별칭 저장에 실패했습니다.'),
      });
      setAliasesPending(false);
      return;
    }

    toast.success('검색 별칭 저장 완료');
    setAliasesPending(false);
    await loadDetail();
  }

  async function handleSaveOptions() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(optionsJson);
    } catch {
      toast.error('옵션 저장 실패', {
        description: '옵션 JSON 형식이 올바르지 않습니다.',
      });
      return;
    }

    if (!Array.isArray(parsed)) {
      toast.error('옵션 저장 실패', {
        description: '옵션 JSON은 배열이어야 합니다.',
      });
      return;
    }

    const optionGroups: ReplaceProductOptionsDto['optionGroups'] = parsed.map((group, groupIndex) => {
      const source = (group ?? {}) as Record<string, unknown>;
      const items = Array.isArray(source.items) ? source.items : [];

      return {
        name: String(source.name ?? '').trim(),
        isRequired: Boolean(source.isRequired),
        selectionType: source.selectionType === 'multi' ? 'multi' : 'single',
        sortOrder: Number(source.sortOrder ?? groupIndex),
        items: items.map((item, itemIndex) => {
          const itemSource = (item ?? {}) as Record<string, unknown>;
          return {
            label: String(itemSource.label ?? '').trim(),
            extraSupplyCost: Number(itemSource.extraSupplyCost ?? 0),
            extraUnitPrice: Number(itemSource.extraUnitPrice ?? 0),
            sortOrder: Number(itemSource.sortOrder ?? itemIndex),
            isActive: itemSource.isActive === undefined ? true : Boolean(itemSource.isActive),
          };
        }),
      };
    });

    setOptionsPending(true);
    const response = await replaceProductOptions(productId, {
      optionGroups,
    });
    if (response.status !== 200 || !response.data.success) {
      toast.error('옵션 저장 실패', {
        description: getApiErrorMessage(response, '옵션 저장에 실패했습니다.'),
      });
      setOptionsPending(false);
      return;
    }

    toast.success('옵션 저장 완료');
    setOptionsPending(false);
    await loadDetail();
  }

  async function handleSavePriceTiers() {
    const normalizeTierRows = (
      rows: PriceTierFormRow[],
    ): ReplaceProductPriceTiersDto['guest'] =>
      rows.map((row) => {
        const minQty = Number(row.minQty || '1');
        const marginRate = Number(row.marginRate || '0');
        const overrideTrimmed = row.unitPriceOverride.trim();

        return {
          minQty: Number.isFinite(minQty) ? minQty : 1,
          marginRate: Number.isFinite(marginRate) ? marginRate : 0,
          unitPriceOverride:
            overrideTrimmed.length === 0
              ? null
              : Number.isFinite(Number(overrideTrimmed))
                ? Number(overrideTrimmed)
                : null,
          isActive: row.isActive,
        };
      });

    const guest = normalizeTierRows(priceTierRows.guest);
    const member = normalizeTierRows(priceTierRows.member);

    setPriceTiersPending(true);
    const response = await replaceProductPriceTiers(
      productId,
      {
        guest,
        member,
      },
    );

    if (response.status !== 200 || !response.data.success) {
      toast.error('가격 티어 저장 실패', {
        description: getApiErrorMessage(response, '가격 티어 저장에 실패했습니다.'),
      });
      setPriceTiersPending(false);
      return;
    }

    toast.success('가격 티어 저장 완료');
    setPriceTiersPending(false);
    await loadDetail();
  }

  async function handleSaveSpecs() {
    let parsed: unknown;
    try {
      parsed = JSON.parse(specsJson);
    } catch {
      toast.error('스펙 저장 실패', {
        description: '스펙 JSON 형식이 올바르지 않습니다.',
      });
      return;
    }

    if (!Array.isArray(parsed)) {
      toast.error('스펙 저장 실패', {
        description: '스펙 JSON은 배열이어야 합니다.',
      });
      return;
    }

    const specGroups: ReplaceProductSpecsDto['specGroups'] = parsed.map((group, groupIndex) => {
      const source = (group ?? {}) as Record<string, unknown>;
      const specs = Array.isArray(source.specs) ? source.specs : [];

      return {
        name: String(source.name ?? '').trim(),
        sortOrder: Number(source.sortOrder ?? groupIndex),
        specs: specs.map((spec, specIndex) => {
          const raw = (spec ?? {}) as Record<string, unknown>;
          return {
            label: String(raw.label ?? '').trim(),
            value: String(raw.value ?? '').trim(),
            sortOrder: Number(raw.sortOrder ?? specIndex),
          };
        }),
      };
    });

    setSpecsPending(true);
    const response = await replaceProductSpecs(productId, { specGroups });
    if (response.status !== 200 || !response.data.success) {
      toast.error('스펙 저장 실패', {
        description: getApiErrorMessage(response, '스펙 저장에 실패했습니다.'),
      });
      setSpecsPending(false);
      return;
    }

    toast.success('스펙 저장 완료');
    setSpecsPending(false);
    await loadDetail();
  }

  async function handleSaveShippingTiers() {
    const shippingTiers: ReplaceProductShippingTiersDto['shippingTiers'] =
      shippingTierRows.map((row) => {
        const minQty = Number(row.minQty || '1');
        const shippingFee = Number(row.shippingFee || '0');
        return {
          minQty: Number.isFinite(minQty) ? minQty : 1,
          shippingFee: Number.isFinite(shippingFee) ? shippingFee : 0,
          isActive: row.isActive,
        };
      });

    setShippingPending(true);
    const response = await replaceProductShippingTiers(
      productId,
      {
        shippingTiers,
      },
    );

    if (response.status !== 200 || !response.data.success) {
      toast.error('배송 티어 저장 실패', {
        description: getApiErrorMessage(response, '배송 티어 저장에 실패했습니다.'),
      });
      setShippingPending(false);
      return;
    }

    toast.success('배송 티어 저장 완료');
    setShippingPending(false);
    await loadDetail();
  }

  async function handlePreviewQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const quantity = Number(quoteForm.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      toast.error('견적 수량 오류', { description: '수량은 1 이상의 정수여야 합니다.' });
      return;
    }

    const selectedOptionItemIds = quoteForm.selectedOptionItemIdsCsv
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => Number.isInteger(v) && v > 0);

    setQuotePending(true);

    const response = await quotePreviewProduct(productId, {
      quantity,
      customerSegment: quoteForm.customerSegment,
      ...(selectedOptionItemIds.length > 0 ? { selectedOptionItemIds } : {}),
    });

    if (response.status !== 200 || !response.data.success) {
      toast.error('견적 미리보기 실패', {
        description: getApiErrorMessage(response, '견적 계산에 실패했습니다.'),
      });
      setQuotePending(false);
      return;
    }

    setQuoteResult(response.data.data);
    setQuotePending(false);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-lg font-bold">상품 상세 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            상품 #{productId} {productName}
          </p>
        </div>
        <div className="ml-auto">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={`/products/edit?id=${productId}`}>기본정보 수정</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">상품 상세를 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* 상세 HTML */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold">상세 HTML</h3>
            <HtmlEditor
              value={descriptionHtml}
              onChange={setDescriptionHtml}
              placeholder="상품 상세 내용을 작성하세요."
              height="360px"
            />
            <Button type="button" size="sm" onClick={() => void handleSaveDescription()} disabled={descriptionPending}>
              {descriptionPending ? '저장 중...' : '상세 HTML 저장'}
            </Button>
          </div>

          {/* SEO */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold">SEO 메타데이터</h3>
            <SeoFormFields
              formState={seoForm}
              onChange={setSeoForm}
              onUploadOgImage={handleUploadOgImage}
              isUploadingOgImage={ogImageUploading}
            />
            <Button type="button" size="sm" onClick={() => void handleSaveSeo()} disabled={seoPending}>
              {seoPending ? '저장 중...' : 'SEO 저장'}
            </Button>
          </div>

          {/* 미디어 */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">상품 미디어</h3>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-50">
                {mediaUploading ? '업로드 중...' : '이미지 업로드'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={mediaUploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleUploadMedia(file);
                    }
                    event.currentTarget.value = '';
                  }}
                />
              </label>
            </div>

            <div className="space-y-2">
              {mediaItems.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 p-3 text-xs text-slate-500">
                  업로드된 상품 이미지가 없습니다.
                </p>
              ) : (
                mediaItems.map((item, index) => (
                  <div key={`${item.url}-${index}`} className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-12">
                    <input
                      className="h-9 rounded-md border border-slate-300 px-3 text-xs text-slate-600 md:col-span-6"
                      value={item.url}
                      readOnly
                    />
                    <input
                      className="h-9 rounded-md border border-slate-300 px-3 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-3"
                      placeholder="대체 텍스트"
                      value={item.altText}
                      onChange={(event) =>
                        setMediaItems((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, altText: event.target.value } : row,
                          ),
                        )
                      }
                    />
                    <input
                      type="number"
                      className="h-9 rounded-md border border-slate-300 px-3 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-2"
                      value={item.sortOrder}
                      onChange={(event) =>
                        setMediaItems((prev) =>
                          prev.map((row, rowIndex) =>
                            rowIndex === index ? { ...row, sortOrder: event.target.value } : row,
                          ),
                        )
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="md:col-span-1"
                      onClick={() =>
                        setMediaItems((prev) => prev.filter((_, rowIndex) => rowIndex !== index))
                      }
                    >
                      삭제
                    </Button>
                  </div>
                ))
              )}
            </div>

            <Button type="button" size="sm" onClick={() => void handleSaveMedia()} disabled={mediaPending}>
              {mediaPending ? '저장 중...' : '미디어 저장'}
            </Button>
          </div>

          {/* 태그 */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold">상품 태그</h3>
            <textarea
              className="min-h-[120px] w-full rounded-md border border-slate-300 p-3 text-xs outline-none ring-cyan-400 focus:ring-2"
              placeholder="쉼표 또는 줄바꿈으로 구분해 입력"
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
            />
            <Button type="button" size="sm" onClick={() => void handleSaveTags()} disabled={tagsPending}>
              {tagsPending ? '저장 중...' : '태그 저장'}
            </Button>
          </div>

          {/* 검색별칭 */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold">검색 별칭</h3>
            <textarea
              className="min-h-[120px] w-full rounded-md border border-slate-300 p-3 text-xs outline-none ring-cyan-400 focus:ring-2"
              placeholder="쉼표 또는 줄바꿈으로 구분해 입력"
              value={aliasesText}
              onChange={(event) => setAliasesText(event.target.value)}
            />
            <Button type="button" size="sm" onClick={() => void handleSaveAliases()} disabled={aliasesPending}>
              {aliasesPending ? '저장 중...' : '검색 별칭 저장'}
            </Button>
          </div>

          {/* 옵션 */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <h3 className="text-sm font-semibold">옵션 전체 저장 (PUT /options)</h3>
            <textarea
              className="min-h-[180px] w-full rounded-md border border-slate-300 p-3 font-mono text-xs outline-none ring-cyan-400 focus:ring-2"
              value={optionsJson}
              onChange={(event) => setOptionsJson(event.target.value)}
            />
            <Button type="button" size="sm" onClick={() => void handleSaveOptions()} disabled={optionsPending}>
              {optionsPending ? '저장 중...' : '옵션 저장'}
            </Button>
          </div>

          {/* 가격티어 */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <h3 className="text-sm font-semibold">수량별 가격 티어</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {(['guest', 'member'] as const).map((segment) => (
                <div key={segment} className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700">
                      {segment === 'guest' ? '비회원(guest)' : '회원(member)'}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => addPriceTierRow(segment)}
                    >
                      티어 추가
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {priceTierRows[segment].length === 0 ? (
                      <p className="rounded-md border border-dashed border-slate-300 p-3 text-xs text-slate-500">
                        등록된 티어가 없습니다.
                      </p>
                    ) : (
                      priceTierRows[segment].map((row, rowIndex) => (
                        <div key={`${segment}-${rowIndex}`} className="grid gap-2 rounded-md border border-slate-200 p-2 md:grid-cols-12">
                          <input
                            type="number"
                            min={1}
                            className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-3"
                            placeholder="최소수량"
                            value={row.minQty}
                            onChange={(event) =>
                              updatePriceTierRow(segment, rowIndex, { minQty: event.target.value })
                            }
                          />
                          <input
                            type="number"
                            min={0}
                            max={100}
                            className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-3"
                            placeholder="마진율(%)"
                            value={row.marginRate}
                            onChange={(event) =>
                              updatePriceTierRow(segment, rowIndex, { marginRate: event.target.value })
                            }
                          />
                          <input
                            type="number"
                            min={0}
                            className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-4"
                            placeholder="단가 Override(선택)"
                            value={row.unitPriceOverride}
                            onChange={(event) =>
                              updatePriceTierRow(segment, rowIndex, {
                                unitPriceOverride: event.target.value,
                              })
                            }
                          />
                          <label className="inline-flex items-center gap-1 text-xs text-slate-700 md:col-span-1">
                            <Checkbox
                              checked={row.isActive}
                              onCheckedChange={(checked) =>
                                updatePriceTierRow(segment, rowIndex, {
                                  isActive: checked === true,
                                })
                              }
                            />
                            ON
                          </label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="md:col-span-1"
                            onClick={() => removePriceTierRow(segment, rowIndex)}
                          >
                            삭제
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => void handleSavePriceTiers()}
              disabled={priceTiersPending}
            >
              {priceTiersPending ? '저장 중...' : '가격 티어 저장'}
            </Button>
          </div>

          {/* 스펙 */}
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <h3 className="text-sm font-semibold">스펙 전체 저장 (PUT /specs)</h3>
            <textarea
              className="min-h-[180px] w-full rounded-md border border-slate-300 p-3 font-mono text-xs outline-none ring-cyan-400 focus:ring-2"
              value={specsJson}
              onChange={(event) => setSpecsJson(event.target.value)}
            />
            <Button type="button" size="sm" onClick={() => void handleSaveSpecs()} disabled={specsPending}>
              {specsPending ? '저장 중...' : '스펙 저장'}
            </Button>
          </div>

          {/* 배송티어 */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">배송비 티어</h3>
              <Button type="button" size="sm" variant="outline" onClick={addShippingTierRow}>
                티어 추가
              </Button>
            </div>
            <div className="space-y-2">
              {shippingTierRows.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 p-3 text-xs text-slate-500">
                  등록된 배송 티어가 없습니다.
                </p>
              ) : (
                shippingTierRows.map((row, rowIndex) => (
                  <div key={`shipping-${rowIndex}`} className="grid gap-2 rounded-md border border-slate-200 p-2 md:grid-cols-12">
                    <input
                      type="number"
                      min={1}
                      className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-4"
                      placeholder="최소수량"
                      value={row.minQty}
                      onChange={(event) =>
                        updateShippingTierRow(rowIndex, { minQty: event.target.value })
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-5"
                      placeholder="배송비"
                      value={row.shippingFee}
                      onChange={(event) =>
                        updateShippingTierRow(rowIndex, { shippingFee: event.target.value })
                      }
                    />
                    <label className="inline-flex items-center gap-1 text-xs text-slate-700 md:col-span-2">
                      <Checkbox
                        checked={row.isActive}
                        onCheckedChange={(checked) =>
                          updateShippingTierRow(rowIndex, { isActive: checked === true })
                        }
                      />
                      ON
                    </label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="md:col-span-1"
                      onClick={() => removeShippingTierRow(rowIndex)}
                    >
                      삭제
                    </Button>
                  </div>
                ))
              )}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSaveShippingTiers()}
              disabled={shippingPending}
            >
              {shippingPending ? '저장 중...' : '배송 티어 저장'}
            </Button>
          </div>

          {/* 견적 미리보기 */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <h3 className="text-sm font-semibold">견적 미리보기</h3>
            <form className="grid gap-3 md:grid-cols-3" onSubmit={handlePreviewQuote}>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-500">수량</span>
                <input
                  type="number"
                  min={1}
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
                  value={quoteForm.quantity}
                  onChange={(event) => setQuoteForm((prev) => ({ ...prev, quantity: event.target.value }))}
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-500">고객 세그먼트</span>
                <Select
                  value={quoteForm.customerSegment}
                  onValueChange={(value) =>
                    setQuoteForm((prev) => ({ ...prev, customerSegment: value as QuoteSegment }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BoQuotePreviewDtoCustomerSegment.guest}>비회원(guest)</SelectItem>
                    <SelectItem value={BoQuotePreviewDtoCustomerSegment.member}>회원(member)</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-500">옵션 아이템 ID (쉼표구분)</span>
                <input
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
                  placeholder="예: 1,2,3"
                  value={quoteForm.selectedOptionItemIdsCsv}
                  onChange={(event) =>
                    setQuoteForm((prev) => ({ ...prev, selectedOptionItemIdsCsv: event.target.value }))
                  }
                />
              </label>

              <div className="md:col-span-3">
                <Button type="submit" size="sm" disabled={quotePending}>
                  {quotePending ? '계산 중...' : '견적 계산'}
                </Button>
              </div>
            </form>

            {quoteResult ? (
              <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm md:grid-cols-2">
                <p>
                  <span className="text-slate-500">적용 단가:</span> {formatNumber(quoteResult.unitPrice)}원
                </p>
                <p>
                  <span className="text-slate-500">공급 총액:</span> {formatNumber(quoteResult.supplyTotal)}원
                </p>
                <p>
                  <span className="text-slate-500">부가세:</span> {formatNumber(quoteResult.vatAmount)}원
                </p>
                <p>
                  <span className="text-slate-500">배송비:</span> {formatNumber(quoteResult.shippingFee)}원
                </p>
                <p>
                  <span className="text-slate-500">예상 마진:</span> {formatNumber(quoteResult.estimatedMargin)}원
                </p>
                <p className="font-semibold text-slate-900">
                  총 결제금액: {formatNumber(quoteResult.totalAmount)}원
                </p>
              </div>
            ) : null}
          </div>

          {/* 원본 데이터 */}
          <details className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
            <summary className="cursor-pointer text-sm font-semibold text-slate-700">
              원본 상세 데이터 (디버깅)
            </summary>
            <pre className="mt-3 max-h-[260px] overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
              {rawJson || '{}'}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
}
