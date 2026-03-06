'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ImageIcon, Package, Truck } from 'lucide-react';
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
  embedded?: boolean;
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

type OptionItemFormRow = {
  label: string;
  extraSupplyCost: string;
  extraUnitPrice: string;
  sortOrder: string;
  isActive: boolean;
};

type OptionGroupFormRow = {
  name: string;
  isRequired: boolean;
  selectionType: 'single' | 'multi';
  sortOrder: string;
  items: OptionItemFormRow[];
};

type SectionType =
  | 'description'
  | 'seo'
  | 'media'
  | 'tags'
  | 'aliases'
  | 'options'
  | 'priceTiers'
  | 'specs'
  | 'shippingTiers'
  | 'quote'
  | 'raw';

const sections: { id: SectionType; label: string }[] = [
  { id: 'description', label: '상세 HTML' },
  { id: 'seo', label: 'SEO 메타데이터' },
  { id: 'media', label: '상품 미디어' },
  { id: 'tags', label: '상품 태그' },
  { id: 'aliases', label: '검색 별칭' },
  { id: 'options', label: '상품 옵션' },
  { id: 'priceTiers', label: '가격 티어' },
  { id: 'specs', label: '상품 스펙' },
  { id: 'shippingTiers', label: '배송 티어' },
  { id: 'quote', label: '견적 미리보기' },
  { id: 'raw', label: '원본 데이터' },
];

export function ProductDetailPage({ productId, embedded = false }: ProductDetailPageProps) {
  const [loading, setLoading] = useState(true);
  const [rawJson, setRawJson] = useState('');
  const [productName, setProductName] = useState('');
  const [activeSection, setActiveSection] = useState<SectionType>('description');

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
  const [optionGroupRows, setOptionGroupRows] = useState<OptionGroupFormRow[]>([]);
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

    // 옵션 데이터를 폼 상태로 변환
    const optionGroups = Array.isArray(detail.optionGroups) ? detail.optionGroups : [];
    setOptionGroupRows(
      optionGroups.map((group, groupIndex) => {
        const groupSource = (group ?? {}) as Record<string, unknown>;
        const items = Array.isArray(groupSource.items) ? groupSource.items : [];

        return {
          name: typeof groupSource.name === 'string' ? groupSource.name : '',
          isRequired: typeof groupSource.isRequired === 'boolean' ? groupSource.isRequired : false,
          selectionType: groupSource.selectionType === 'multi' ? 'multi' : 'single',
          sortOrder: String(typeof groupSource.sortOrder === 'number' ? groupSource.sortOrder : groupIndex),
          items: items.map((item, itemIndex) => {
            const itemSource = (item ?? {}) as Record<string, unknown>;
            return {
              label: typeof itemSource.label === 'string' ? itemSource.label : '',
              extraSupplyCost: String(typeof itemSource.extraSupplyCost === 'number' ? itemSource.extraSupplyCost : 0),
              extraUnitPrice: String(typeof itemSource.extraUnitPrice === 'number' ? itemSource.extraUnitPrice : 0),
              sortOrder: String(typeof itemSource.sortOrder === 'number' ? itemSource.sortOrder : itemIndex),
              isActive: typeof itemSource.isActive === 'boolean' ? itemSource.isActive : true,
            };
          }),
        };
      }),
    );
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

  async function handleUploadDescriptionImage(file: File) {
    const uploaded = await uploadProductImageFile(file);
    toast.success('상세 HTML 이미지 업로드 완료');
    return uploaded;
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

  // 옵션 그룹 CRUD
  function addOptionGroup() {
    setOptionGroupRows((prev) => [
      ...prev,
      {
        name: '',
        isRequired: false,
        selectionType: 'single',
        sortOrder: String(prev.length),
        items: [],
      },
    ]);
  }

  function removeOptionGroup(groupIndex: number) {
    setOptionGroupRows((prev) => prev.filter((_, index) => index !== groupIndex));
  }

  function updateOptionGroup(groupIndex: number, patch: Partial<OptionGroupFormRow>) {
    setOptionGroupRows((prev) =>
      prev.map((group, index) => (index === groupIndex ? { ...group, ...patch } : group)),
    );
  }

  // 옵션 아이템 CRUD
  function addOptionItem(groupIndex: number) {
    setOptionGroupRows((prev) =>
      prev.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              items: [
                ...group.items,
                {
                  label: '',
                  extraSupplyCost: '0',
                  extraUnitPrice: '0',
                  sortOrder: String(group.items.length),
                  isActive: true,
                },
              ],
            }
          : group,
      ),
    );
  }

  function removeOptionItem(groupIndex: number, itemIndex: number) {
    setOptionGroupRows((prev) =>
      prev.map((group, gIndex) =>
        gIndex === groupIndex
          ? {
              ...group,
              items: group.items.filter((_, iIndex) => iIndex !== itemIndex),
            }
          : group,
      ),
    );
  }

  function updateOptionItem(
    groupIndex: number,
    itemIndex: number,
    patch: Partial<OptionItemFormRow>,
  ) {
    setOptionGroupRows((prev) =>
      prev.map((group, gIndex) =>
        gIndex === groupIndex
          ? {
              ...group,
              items: group.items.map((item, iIndex) =>
                iIndex === itemIndex ? { ...item, ...patch } : item,
              ),
            }
          : group,
      ),
    );
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
    // 폼 데이터를 DTO로 변환
    const optionGroups: ReplaceProductOptionsDto['optionGroups'] = optionGroupRows.map((group) => ({
      name: group.name.trim(),
      isRequired: group.isRequired,
      selectionType: group.selectionType,
      sortOrder: Number(group.sortOrder || 0),
      items: group.items.map((item) => ({
        label: item.label.trim(),
        extraSupplyCost: Number(item.extraSupplyCost || 0),
        extraUnitPrice: Number(item.extraUnitPrice || 0),
        sortOrder: Number(item.sortOrder || 0),
        isActive: item.isActive,
      })),
    }));

    // 유효성 검사
    const hasEmptyGroupName = optionGroups.some((group) => group.name.length === 0);
    if (hasEmptyGroupName) {
      toast.error('옵션 저장 실패', {
        description: '옵션 그룹명이 비어있는 항목이 있습니다.',
      });
      return;
    }

    const hasEmptyItemLabel = optionGroups.some((group) =>
      group.items.some((item) => item.label.length === 0),
    );
    if (hasEmptyItemLabel) {
      toast.error('옵션 저장 실패', {
        description: '옵션 아이템 라벨이 비어있는 항목이 있습니다.',
      });
      return;
    }

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
      {embedded ? null : (
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
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">상품 상세를 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* 좌측 메뉴 */}
          <nav className="lg:col-span-3">
            <div className="sticky top-4 space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </nav>

          {/* 우측 컨텐츠 */}
          <div className="lg:col-span-9">
            {/* 상세 HTML */}
            {activeSection === 'description' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">상세 HTML</h3>
                    <p className="text-sm text-slate-500">상품 상세 페이지 컨텐츠를 작성합니다</p>
                  </div>
              <HtmlEditor
                value={descriptionHtml}
                onChange={setDescriptionHtml}
                onUploadImage={handleUploadDescriptionImage}
                placeholder="상품 상세 내용을 작성하세요."
                height="360px"
              />
                  <Button type="button" size="sm" onClick={() => void handleSaveDescription()} disabled={descriptionPending}>
                    {descriptionPending ? '저장 중...' : '상세 HTML 저장'}
                  </Button>
                </div>
              </div>
            )}

            {/* SEO */}
            {activeSection === 'seo' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">SEO 메타데이터</h3>
                    <p className="text-sm text-slate-500">검색 엔진 최적화를 위한 메타 정보를 설정합니다</p>
                  </div>
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
              </div>
            )}

            {/* 미디어 */}
            {activeSection === 'media' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">상품 미디어</h3>
                      <p className="text-sm text-slate-500">상품 이미지, 동영상 등을 관리합니다</p>
                    </div>
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

              <div className="space-y-3">
                {mediaItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 py-12">
                    <ImageIcon className="mb-3 size-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">업로드된 이미지가 없습니다</p>
                    <p className="text-xs text-slate-400">이미지 업로드 버튼을 클릭하여 추가하세요</p>
                  </div>
                ) : (
                  mediaItems.map((item, index) => (
                    <div key={`${item.url}-${index}`} className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 md:grid-cols-12">
                      <input
                        className="h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-600 md:col-span-6"
                        value={item.url}
                        readOnly
                      />
                      <input
                        className="h-9 rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2 md:col-span-3"
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
                        className="h-9 rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2 md:col-span-2"
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
              </div>
            )}

            {/* 태그 */}
            {activeSection === 'tags' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">상품 태그</h3>
                    <p className="text-sm text-slate-500">상품 분류를 위한 태그를 관리합니다</p>
                  </div>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-slate-300 p-3 text-sm outline-none ring-cyan-400 focus:ring-2"
                placeholder="쉼표 또는 줄바꿈으로 구분해 입력"
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
              />
                  <Button type="button" size="sm" onClick={() => void handleSaveTags()} disabled={tagsPending}>
                    {tagsPending ? '저장 중...' : '태그 저장'}
                  </Button>
                </div>
              </div>
            )}

            {/* 검색별칭 */}
            {activeSection === 'aliases' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">검색 별칭</h3>
                    <p className="text-sm text-slate-500">검색에 사용될 대체 키워드를 설정합니다</p>
                  </div>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-slate-300 p-3 text-sm outline-none ring-cyan-400 focus:ring-2"
                placeholder="쉼표 또는 줄바꿈으로 구분해 입력"
                value={aliasesText}
                onChange={(event) => setAliasesText(event.target.value)}
              />
                  <Button type="button" size="sm" onClick={() => void handleSaveAliases()} disabled={aliasesPending}>
                    {aliasesPending ? '저장 중...' : '검색 별칭 저장'}
                  </Button>
                </div>
              </div>
            )}

            {/* 옵션 */}
            {activeSection === 'options' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">상품 옵션</h3>
                      <p className="text-sm text-slate-500">옵션 그룹과 아이템을 관리합니다</p>
                    </div>
                <Button type="button" size="sm" variant="outline" onClick={addOptionGroup}>
                  옵션 그룹 추가
                </Button>
              </div>

            <div className="space-y-4">
              {optionGroupRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 py-12">
                  <Package className="mb-3 size-10 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">등록된 옵션 그룹이 없습니다</p>
                  <p className="text-xs text-slate-400">옵션 그룹 추가 버튼을 클릭하여 시작하세요</p>
                </div>
              ) : (
                optionGroupRows.map((group, groupIndex) => (
                  <div
                    key={`group-${groupIndex}`}
                    className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
                  >
                    {/* 그룹 헤더 */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                          <span className="text-xs font-semibold">{groupIndex + 1}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          옵션 그룹 #{groupIndex + 1}
                        </h4>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeOptionGroup(groupIndex)}
                      >
                        그룹 삭제
                      </Button>
                    </div>

                    {/* 그룹 정보 */}
                    <div className="grid gap-3 md:grid-cols-12">
                      <div className="space-y-1 md:col-span-4">
                        <span className="text-xs font-semibold text-slate-600">그룹명</span>
                        <input
                          className="h-9 w-full rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2"
                          placeholder="예: 색상"
                          value={group.name}
                          onChange={(event) =>
                            updateOptionGroup(groupIndex, { name: event.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1 md:col-span-3">
                        <span className="text-xs font-semibold text-slate-600">선택 방식</span>
                        <Select
                          value={group.selectionType}
                          onValueChange={(value) =>
                            updateOptionGroup(groupIndex, {
                              selectionType: value as 'single' | 'multi',
                            })
                          }
                        >
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">단일 선택</SelectItem>
                            <SelectItem value="multi">다중 선택</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <span className="text-xs font-semibold text-slate-600">정렬순서</span>
                        <input
                          type="number"
                          min={0}
                          className="h-9 w-full rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2"
                          value={group.sortOrder}
                          onChange={(event) =>
                            updateOptionGroup(groupIndex, { sortOrder: event.target.value })
                          }
                        />
                      </div>
                      <div className="flex items-end md:col-span-3">
                        <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                          <Checkbox
                            checked={group.isRequired}
                            onCheckedChange={(checked) =>
                              updateOptionGroup(groupIndex, { isRequired: checked === true })
                            }
                          />
                          필수 선택
                        </label>
                      </div>
                    </div>

                    {/* 아이템 관리 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          옵션 아이템 ({group.items.length}개)
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addOptionItem(groupIndex)}
                        >
                          아이템 추가
                        </Button>
                      </div>

                      {group.items.length > 0 ? (
                        <div className="hidden rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 md:grid md:grid-cols-12">
                          <span className="md:col-span-3">라벨</span>
                          <span className="md:col-span-3">추가 공급가</span>
                          <span className="md:col-span-3">추가 단가</span>
                          <span className="md:col-span-1">정렬</span>
                          <span className="md:col-span-1">활성</span>
                          <span className="text-right md:col-span-1">삭제</span>
                        </div>
                      ) : null}

                      <div className="space-y-3">
                        {group.items.length === 0 ? (
                          <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 py-8 text-center">
                            <p className="text-sm font-medium text-slate-500">옵션 아이템이 없습니다</p>
                            <p className="text-xs text-slate-400">아이템 추가 버튼을 클릭하세요</p>
                          </div>
                        ) : (
                          group.items.map((item, itemIndex) => (
                            <div
                              key={`item-${groupIndex}-${itemIndex}`}
                              className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-12"
                            >
                              <input
                                className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-3"
                                placeholder="예: 빨강"
                                value={item.label}
                                onChange={(event) =>
                                  updateOptionItem(groupIndex, itemIndex, {
                                    label: event.target.value,
                                  })
                                }
                              />
                              <input
                                type="number"
                                min={0}
                                className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-3"
                                placeholder="0"
                                value={item.extraSupplyCost}
                                onChange={(event) =>
                                  updateOptionItem(groupIndex, itemIndex, {
                                    extraSupplyCost: event.target.value,
                                  })
                                }
                              />
                              <input
                                type="number"
                                min={0}
                                className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-3"
                                placeholder="0"
                                value={item.extraUnitPrice}
                                onChange={(event) =>
                                  updateOptionItem(groupIndex, itemIndex, {
                                    extraUnitPrice: event.target.value,
                                  })
                                }
                              />
                              <input
                                type="number"
                                min={0}
                                className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-1"
                                value={item.sortOrder}
                                onChange={(event) =>
                                  updateOptionItem(groupIndex, itemIndex, {
                                    sortOrder: event.target.value,
                                  })
                                }
                              />
                              <label className="inline-flex items-center gap-1 text-xs text-slate-700 md:col-span-1">
                                <Checkbox
                                  checked={item.isActive}
                                  onCheckedChange={(checked) =>
                                    updateOptionItem(groupIndex, itemIndex, {
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
                                onClick={() => removeOptionItem(groupIndex, itemIndex)}
                              >
                                삭제
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              </div>

                  <Button type="button" size="sm" onClick={() => void handleSaveOptions()} disabled={optionsPending}>
                    {optionsPending ? '저장 중...' : '옵션 저장'}
                  </Button>
                </div>
              </div>
            )}

            {/* 가격티어 */}
            {activeSection === 'priceTiers' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">수량별 가격 티어</h3>
                    <p className="text-sm text-slate-500">비회원/회원 세그먼트별 가격 정책을 설정합니다</p>
                  </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              {(['guest', 'member'] as const).map((segment, segmentIndex) => (
                <div
                  key={segment}
                  className={`space-y-3 p-6 ${
                    segmentIndex > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      {segment === 'guest' ? '비회원 (guest)' : '회원 (member)'}
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

                  {priceTierRows[segment].length > 0 ? (
                    <div className="hidden rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 md:grid md:grid-cols-12">
                      <span className="md:col-span-3">최소 수량</span>
                      <span className="md:col-span-3">마진율(%)</span>
                      <span className="md:col-span-4">단가 Override</span>
                      <span className="md:col-span-1">활성</span>
                      <span className="text-right md:col-span-1">삭제</span>
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    {priceTierRows[segment].length === 0 ? (
                      <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 py-8 text-center">
                        <p className="text-sm font-medium text-slate-500">등록된 티어가 없습니다</p>
                        <p className="text-xs text-slate-400">티어 추가 버튼을 클릭하세요</p>
                      </div>
                    ) : (
                      priceTierRows[segment].map((row, rowIndex) => (
                        <div key={`${segment}-${rowIndex}`} className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-12">
                          <input
                            type="number"
                            min={1}
                            className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-3"
                            placeholder="예: 100"
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
                            placeholder="예: 25"
                            value={row.marginRate}
                            onChange={(event) =>
                              updatePriceTierRow(segment, rowIndex, { marginRate: event.target.value })
                            }
                          />
                          <input
                            type="number"
                            min={0}
                            className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-4"
                            placeholder="비우면 자동 계산"
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
              </div>
            )}

            {/* 스펙 */}
            {activeSection === 'specs' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">상품 스펙</h3>
                    <p className="text-sm text-slate-500">상품의 세부 사양 정보를 관리합니다</p>
                  </div>
              <textarea
                className="min-h-[180px] w-full rounded-md border border-slate-300 p-3 font-mono text-xs outline-none ring-cyan-400 focus:ring-2"
                value={specsJson}
                onChange={(event) => setSpecsJson(event.target.value)}
              />
                  <Button type="button" size="sm" onClick={() => void handleSaveSpecs()} disabled={specsPending}>
                    {specsPending ? '저장 중...' : '스펙 저장'}
                  </Button>
                </div>
              </div>
            )}

            {/* 배송티어 */}
            {activeSection === 'shippingTiers' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">배송비 티어</h3>
                      <p className="text-sm text-slate-500">주문 수량에 따른 배송비 정책을 설정합니다</p>
                    </div>
                <Button type="button" size="sm" variant="outline" onClick={addShippingTierRow}>
                  티어 추가
                </Button>
              </div>
            <div className="space-y-3">
              {shippingTierRows.length > 0 ? (
                <div className="hidden rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 md:grid md:grid-cols-12">
                  <span className="md:col-span-4">최소 수량 (minQty)</span>
                  <span className="md:col-span-5">배송비 (원)</span>
                  <span className="md:col-span-2">활성</span>
                  <span className="text-right md:col-span-1">삭제</span>
                </div>
              ) : null}
              {shippingTierRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 py-12">
                  <Truck className="mb-3 size-10 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">등록된 배송 티어가 없습니다</p>
                  <p className="text-xs text-slate-400">티어가 없으면 배송비는 0원으로 계산됩니다</p>
                </div>
              ) : (
                shippingTierRows.map((row, rowIndex) => (
                  <div key={`shipping-${rowIndex}`} className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-12">
                    <input
                      type="number"
                      min={1}
                      className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-4"
                      placeholder="예: 100"
                      value={row.minQty}
                      onChange={(event) =>
                        updateShippingTierRow(rowIndex, { minQty: event.target.value })
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      className="h-9 rounded-md border border-slate-300 px-2 text-xs outline-none ring-cyan-400 focus:ring-2 md:col-span-5"
                      placeholder="예: 3000"
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
              </div>
            )}

            {/* 견적 미리보기 */}
            {activeSection === 'quote' && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">견적 미리보기</h3>
                    <p className="text-sm text-slate-500">설정한 가격 정책으로 견적을 미리 계산합니다</p>
                  </div>
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
            </div>
          )}

          {/* 원본 데이터 */}
          {activeSection === 'raw' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">원본 데이터</h3>
                  <p className="text-sm text-slate-500">디버깅을 위한 원본 JSON 데이터입니다</p>
                </div>
                <pre className="max-h-[500px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100">
                  {rawJson || '{}'}
                </pre>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
    </section>
  );
}
