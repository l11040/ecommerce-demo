'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CreateProductDtoStatus,
  list as listCategories,
  listProducts,
  type List200DataItem,
  type ListProducts200DataItem,
} from '@/api/bo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api-response';
import { RefreshCcw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { formatNumber, statusBadgeClass, statusLabel } from './product-form-fields';

type ProductFilterState = {
  keyword: string;
  storeId: string;
  categoryId: string;
  status: 'all' | (typeof CreateProductDtoStatus)[keyof typeof CreateProductDtoStatus];
  isVisible: 'all' | 'true' | 'false';
  minMoq: string;
  maxMoq: string;
};

const allValue = '__all__';

const defaultFilterState: ProductFilterState = {
  keyword: '',
  storeId: '',
  categoryId: '',
  status: 'all',
  isVisible: 'all',
  minMoq: '',
  maxMoq: '',
};

export function ProductsPage() {
  const [products, setProducts] = useState<ListProducts200DataItem[]>([]);
  const [categories, setCategories] = useState<List200DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ProductFilterState>(defaultFilterState);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.path.localeCompare(b.path, 'ko')),
    [categories],
  );

  const categoryNameById = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const storeIds = useMemo(() => {
    return [...new Set(products.map((product) => product.storeId))].sort((a, b) => a - b);
  }, [products]);

  const loadCategories = useCallback(async () => {
    const response = await listCategories();
    if (response.status !== 200 || !response.data.success) {
      toast.error('카테고리 목록 조회 실패', {
        description: getApiErrorMessage(response, '카테고리 목록을 불러오지 못했습니다.'),
      });
      return;
    }
    setCategories(response.data.data);
  }, []);

  const loadProducts = useCallback(async (source: ProductFilterState) => {
    setLoading(true);
    const response = await listProducts({
      ...(source.storeId ? { storeId: source.storeId } : {}),
      ...(source.categoryId ? { categoryId: source.categoryId } : {}),
      ...(source.status !== 'all' ? { status: source.status } : {}),
      ...(source.isVisible !== 'all' ? { isVisible: source.isVisible } : {}),
      ...(source.keyword.trim() ? { keyword: source.keyword.trim() } : {}),
      ...(source.minMoq.trim() ? { minMoq: source.minMoq.trim() } : {}),
      ...(source.maxMoq.trim() ? { maxMoq: source.maxMoq.trim() } : {}),
    });

    if (response.status !== 200 || !response.data.success) {
      toast.error('상품 목록 조회 실패', {
        description: getApiErrorMessage(response, '상품 목록을 불러오지 못했습니다.'),
      });
      setLoading(false);
      return;
    }

    setProducts(response.data.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        await Promise.all([loadCategories(), loadProducts(defaultFilterState)]);
      })();
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadCategories, loadProducts]);

  async function handleApplyFilters() {
    await loadProducts(filters);
  }

  async function handleResetFilters() {
    setFilters(defaultFilterState);
    await loadProducts(defaultFilterState);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">상품 관리</h2>
          <p className="mt-1 text-sm text-slate-500">
            상품 목록 조회, 생성, 기본정보 수정, 상세 관리를 제공합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => void loadProducts(filters)} disabled={loading}>
            <RefreshCcw className="size-4" />
            {loading ? '갱신 중...' : '새로고침'}
          </Button>
          <Button asChild>
            <Link href="/products/new">상품 생성</Link>
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <div className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-4 xl:grid-cols-8">
        <label className="relative md:col-span-2 xl:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="h-9 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none ring-cyan-400 focus:ring-2"
            placeholder="상품명/슬러그 검색"
            value={filters.keyword}
            onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value }))}
          />
        </label>

        <Select
          value={filters.storeId || allValue}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, storeId: value === allValue ? '' : value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="스토어 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allValue}>스토어 전체</SelectItem>
            {storeIds.map((storeId) => (
              <SelectItem key={storeId} value={String(storeId)}>
                스토어 #{storeId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.categoryId || allValue}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, categoryId: value === allValue ? '' : value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="카테고리 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allValue}>카테고리 전체</SelectItem>
            {sortedCategories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                [{category.depth}] {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value as ProductFilterState['status'] }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="상태 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">상태 전체</SelectItem>
            <SelectItem value={CreateProductDtoStatus.draft}>임시저장</SelectItem>
            <SelectItem value={CreateProductDtoStatus.published}>게시중</SelectItem>
            <SelectItem value={CreateProductDtoStatus.soldout}>품절</SelectItem>
            <SelectItem value={CreateProductDtoStatus.stopped}>중지</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.isVisible}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, isVisible: value as ProductFilterState['isVisible'] }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="노출 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">노출 전체</SelectItem>
            <SelectItem value="true">노출</SelectItem>
            <SelectItem value="false">미노출</SelectItem>
          </SelectContent>
        </Select>

        <input
          type="number"
          className="h-9 rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          placeholder="MOQ 최소"
          value={filters.minMoq}
          onChange={(event) => setFilters((prev) => ({ ...prev, minMoq: event.target.value }))}
        />
        <input
          type="number"
          className="h-9 rounded-md border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
          placeholder="MOQ 최대"
          value={filters.maxMoq}
          onChange={(event) => setFilters((prev) => ({ ...prev, maxMoq: event.target.value }))}
        />

        <div className="flex items-center gap-2 xl:col-span-8">
          <Button type="button" size="sm" onClick={() => void handleApplyFilters()}>
            검색
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => void handleResetFilters()}>
            초기화
          </Button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">상품명</th>
              <th className="px-3 py-3">스토어/카테고리</th>
              <th className="px-3 py-3">상태</th>
              <th className="px-3 py-3">노출</th>
              <th className="px-3 py-3">MOQ</th>
              <th className="px-3 py-3">공급가</th>
              <th className="px-3 py-3">업데이트</th>
              <th className="px-3 py-3">액션</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-100 align-middle">
                <td className="px-3 py-3 font-mono text-xs text-slate-600">#{product.id}</td>
                <td className="px-3 py-3">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.slug}</p>
                </td>
                <td className="px-3 py-3 text-xs text-slate-600">
                  <p>스토어 #{product.storeId}</p>
                  <p>
                    {product.categoryId === null
                      ? '카테고리 없음'
                      : categoryNameById.get(product.categoryId) ?? `카테고리 #${product.categoryId}`}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(product.status)}`}>
                    {statusLabel(product.status)}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-slate-600">{product.isVisible ? '노출' : '미노출'}</td>
                <td className="px-3 py-3 text-xs text-slate-600">{formatNumber(product.moq)}</td>
                <td className="px-3 py-3 text-xs text-slate-600">{formatNumber(product.baseSupplyCost)}원</td>
                <td className="px-3 py-3 text-xs text-slate-600">{new Date(product.updatedAt).toLocaleString('ko-KR')}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <Button type="button" size="xs" variant="outline" asChild>
                      <Link href={`/products/${product.id}`}>상세</Link>
                    </Button>
                    <Button type="button" size="xs" variant="outline" asChild>
                      <Link href={`/products/edit?id=${product.id}`}>수정</Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          조회된 상품이 없습니다.
        </div>
      ) : null}
    </section>
  );
}
