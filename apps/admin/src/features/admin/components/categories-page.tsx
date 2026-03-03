'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MinusSquare, Plus, PlusSquare, RefreshCcw, Search } from 'lucide-react';
import { list, type List200DataItem } from '@/api/bo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

export function CategoriesPage() {
  const [categories, setCategories] = useState<List200DataItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const [searchKeyword, setSearchKeyword] = useState('');
  const [depthFilter, setDepthFilter] = useState<'all' | '1' | '2' | '3' | '4'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'true' | 'false'>('all');
  const [visibleFilter, setVisibleFilter] = useState<'all' | 'true' | 'false'>('all');
  const [mainFilter, setMainFilter] = useState<'all' | 'true' | 'false'>('all');

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError('');

    const response = await list();
    if (response.status !== 200 || !response.data.success) {
      const msg = response.data.message ?? '카테고리 조회에 실패했습니다.';
      setCategoriesError(msg);
      toast.error('카테고리 조회 실패', { description: msg });
      setCategoriesLoading(false);
      return;
    }

    const nextCategories = [...response.data.data].sort((a, b) => a.path.localeCompare(b.path, 'ko'));

    setCategories(nextCategories);
    setExpandedIds(
      nextCategories.reduce<Record<number, boolean>>((acc, category) => {
        acc[category.id] = false;
        return acc;
      }, {}),
    );

    setCategoriesLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCategories();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadCategories]);

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const matchedCategories = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    return categories.filter((category) => {
      if (depthFilter !== 'all' && category.depth !== Number(depthFilter)) {
        return false;
      }

      if (activeFilter !== 'all' && category.isActive !== (activeFilter === 'true')) {
        return false;
      }

      if (visibleFilter !== 'all' && category.isVisible !== (visibleFilter === 'true')) {
        return false;
      }

      if (mainFilter !== 'all' && category.isMainExposed !== (mainFilter === 'true')) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      const haystack = `${category.name} ${category.slug} ${category.path}`.toLowerCase();
      return haystack.includes(normalizedKeyword);
    });
  }, [activeFilter, categories, depthFilter, mainFilter, searchKeyword, visibleFilter]);

  const visibleCategoryIds = useMemo(() => {
    const ids = new Set<number>();

    matchedCategories.forEach((category) => {
      ids.add(category.id);

      let parentId = category.parentId;
      while (parentId) {
        ids.add(parentId);
        parentId = categoryById.get(parentId)?.parentId ?? null;
      }
    });

    return ids;
  }, [categoryById, matchedCategories]);

  const visibleCategories = useMemo(
    () => categories.filter((category) => visibleCategoryIds.has(category.id)),
    [categories, visibleCategoryIds],
  );

  const childrenByParent = useMemo(() => {
    const map = new Map<number | null, List200DataItem[]>();

    visibleCategories.forEach((category) => {
      const key = category.parentId;
      const current = map.get(key) ?? [];
      current.push(category);
      map.set(key, current);
    });

    map.forEach((items) => {
      items.sort((a, b) => a.path.localeCompare(b.path, 'ko'));
    });

    return map;
  }, [visibleCategories]);

  const flatRows = useMemo(() => {
    const rows: List200DataItem[] = [];

    function dfs(parentId: number | null) {
      const children = childrenByParent.get(parentId) ?? [];

      children.forEach((child) => {
        rows.push(child);
        if (expandedIds[child.id]) {
          dfs(child.id);
        }
      });
    }

    dfs(null);
    return rows;
  }, [childrenByParent, expandedIds]);

  const hasAnyExpanded = visibleCategories.some((category) => expandedIds[category.id]);

  function resetFilters() {
    setSearchKeyword('');
    setDepthFilter('all');
    setActiveFilter('all');
    setVisibleFilter('all');
    setMainFilter('all');
  }

  function toggleExpanded(categoryId: number) {
    setExpandedIds((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }

  function setAllExpanded(value: boolean) {
    setExpandedIds(
      visibleCategories.reduce<Record<number, boolean>>((acc, category) => {
        acc[category.id] = value;
        return acc;
      }, {}),
    );
  }

  function getDepthRowClass(depth: number) {
    if (depth === 1) return 'bg-slate-50';
    if (depth === 2) return 'bg-slate-100/75';
    if (depth === 3) return 'bg-slate-200/65';
    return 'bg-slate-300/55';
  }

  function getDepthBadgeClass(depth: number) {
    if (depth === 1) return 'bg-slate-100 text-slate-700';
    if (depth === 2) return 'bg-slate-200 text-slate-700';
    if (depth === 3) return 'bg-slate-400 text-slate-900';
    return 'bg-slate-500 text-white';
  }

  return (
    <TooltipProvider>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">카테고리 목록</h2>
            <p className="mt-1 text-sm text-slate-500">
              전체 {categories.length}개 / 조건 매칭 {matchedCategories.length}개 / 표시 {visibleCategories.length}개
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild type="button">
              <Link href="/categories/new">
                <Plus className="size-4" />
                카테고리 생성
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => void loadCategories()} disabled={categoriesLoading}>
              <RefreshCcw className="size-4" />
              {categoriesLoading ? '새로고침 중...' : '목록 새로고침'}
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-2">
          <label className="relative block w-[320px] max-w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none ring-cyan-400 focus:ring-2"
              placeholder="검색어 입력"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </label>

          <Select value={depthFilter} onValueChange={(value) => setDepthFilter(value as 'all' | '1' | '2' | '3' | '4')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="전체 depth" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 depth</SelectItem>
              <SelectItem value="1">depth 1</SelectItem>
              <SelectItem value="2">depth 2</SelectItem>
              <SelectItem value="3">depth 3</SelectItem>
              <SelectItem value="4">depth 4</SelectItem>
            </SelectContent>
          </Select>

          <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as 'all' | 'true' | 'false')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="활성 전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">활성 전체</SelectItem>
              <SelectItem value="true">활성만</SelectItem>
              <SelectItem value="false">비활성만</SelectItem>
            </SelectContent>
          </Select>

          <Select value={visibleFilter} onValueChange={(value) => setVisibleFilter(value as 'all' | 'true' | 'false')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="노출 전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">노출 전체</SelectItem>
              <SelectItem value="true">노출만</SelectItem>
              <SelectItem value="false">미노출만</SelectItem>
            </SelectContent>
          </Select>

          <Select value={mainFilter} onValueChange={(value) => setMainFilter(value as 'all' | 'true' | 'false')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="메인 전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">메인 전체</SelectItem>
              <SelectItem value="true">메인노출만</SelectItem>
              <SelectItem value="false">메인미노출만</SelectItem>
            </SelectContent>
          </Select>

          <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
            초기화
          </Button>
        </div>

        {categoriesError ? <p className="mb-3 text-sm font-medium text-rose-500">{categoriesError}</p> : null}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="w-[120px] px-3 py-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setAllExpanded(!hasAnyExpanded)}
                        aria-label={hasAnyExpanded ? '전체 접기' : '전체 펼치기'}
                      >
                        {hasAnyExpanded ? <MinusSquare className="size-4" /> : <PlusSquare className="size-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={3}>{hasAnyExpanded ? '전체 접기' : '전체 펼치기'}</TooltipContent>
                  </Tooltip>
                </th>
                <th className="px-3 py-3">카테고리</th>
                <th className="px-3 py-3">Path</th>
                <th className="px-3 py-3">Slug</th>
                <th className="px-3 py-3">상태</th>
                <th className="px-3 py-3">정렬</th>
                <th className="px-3 py-3">액션</th>
              </tr>
            </thead>
            <tbody>
              {flatRows.map((category) => {
                const children = childrenByParent.get(category.id) ?? [];
                const hasChildren = children.length > 0;
                const isExpanded = !!expandedIds[category.id];

                const statusLabel = [
                  category.isActive ? '활성' : '비활성',
                  category.isVisible ? '노출' : '미노출',
                  category.isMainExposed ? '메인노출' : '메인미노출',
                ].join(' / ');

                return (
                  <tr key={category.id} className={`border-b border-slate-100 align-middle ${getDepthRowClass(category.depth)}`}>
                    <td className="px-3 py-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="rounded-md p-1 hover:bg-slate-100 disabled:opacity-40"
                            onClick={() => toggleExpanded(category.id)}
                            disabled={!hasChildren}
                            aria-label={isExpanded ? '접기' : '펼치기'}
                          >
                            {isExpanded ? (
                              <MinusSquare className="size-4 text-slate-500" />
                            ) : (
                              <PlusSquare className="size-4 text-slate-500" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={3}>{isExpanded ? '접기' : '펼치기'}</TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2" style={{ paddingLeft: `${(category.depth - 1) * 14}px` }}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${getDepthBadgeClass(category.depth)}`}>
                          D{category.depth}
                        </span>
                        <span className="font-medium">{category.name}</span>
                        <span className="text-xs text-slate-400">#{category.id}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-600">{category.path}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{category.slug}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{statusLabel}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{category.sortOrder}</td>
                    <td className="px-3 py-3">
                      <Button asChild type="button" size="sm">
                        <Link href={`/categories/edit?id=${category.id}`}>수정</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {flatRows.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            조건에 맞는 카테고리가 없습니다.
          </div>
        ) : null}
      </section>
    </TooltipProvider>
  );
}
