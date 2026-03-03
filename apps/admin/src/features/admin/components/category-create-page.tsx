'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { create, list, type CreateCategoryDto, type List200DataItem } from '@/api/bo';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CategoryFormState = {
  name: string;
  slug: string;
  parentId: string;
  sortOrder: string;
  isActive: boolean;
  isVisible: boolean;
  isMainExposed: boolean;
};

const defaultCategoryForm: CategoryFormState = {
  name: '',
  slug: '',
  parentId: '',
  sortOrder: '0',
  isActive: true,
  isVisible: true,
  isMainExposed: false,
};

const noneParentValue = '__none__';

export function CategoryCreatePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<List200DataItem[]>([]);
  const [categoriesError, setCategoriesError] = useState('');
  const [formState, setFormState] = useState<CategoryFormState>(defaultCategoryForm);
  const [pending, setPending] = useState(false);

  const parentCandidates = useMemo(
    () => categories.filter((category) => category.depth < 4),
    [categories],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const response = await list();
        if (response.status !== 200 || !response.data.success) {
          const msg = response.data.message ?? '상위 카테고리 목록을 불러오지 못했습니다.';
          setCategoriesError(msg);
          toast.error('카테고리 목록 조회 실패', { description: msg });
          return;
        }

        setCategories(response.data.data);
      })();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);

    const payload: CreateCategoryDto = {
      name: formState.name.trim(),
      slug: formState.slug.trim(),
      sortOrder: Number(formState.sortOrder || '0'),
      isActive: formState.isActive,
      isVisible: formState.isVisible,
      isMainExposed: formState.isMainExposed,
    };

    if (formState.parentId.trim()) {
      payload.parentId = Number(formState.parentId);
    }

    const response = await create(payload);
    if (response.status !== 200 || !response.data.success) {
      toast.error('카테고리 생성 실패', {
        description: response.data.message ?? '카테고리 생성에 실패했습니다.',
      });
      setPending(false);
      return;
    }

    toast.success('카테고리 생성 완료');
    router.push('/categories');
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">카테고리 생성</h2>
          <p className="mt-1 text-sm text-slate-500">최대 4 depth까지 생성 가능합니다.</p>
        </div>

        <Button asChild type="button" variant="outline">
          <Link href="/categories">
            <ArrowLeft className="size-4" />
            목록으로
          </Link>
        </Button>
      </div>

      {categoriesError ? <p className="mb-3 text-sm font-medium text-rose-500">{categoriesError}</p> : null}

      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">이름</span>
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">슬러그</span>
          <input
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
            value={formState.slug}
            onChange={(event) => setFormState((prev) => ({ ...prev, slug: event.target.value }))}
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">상위 카테고리</span>
          <Select
            value={formState.parentId || noneParentValue}
            onValueChange={(value) =>
              setFormState((prev) => ({
                ...prev,
                parentId: value === noneParentValue ? '' : value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="없음 (depth 1)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={noneParentValue}>없음 (depth 1)</SelectItem>
              {parentCandidates.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  [{category.depth}] {category.name} ({category.path})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">정렬 순서</span>
          <input
            type="number"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
            value={formState.sortOrder}
            onChange={(event) => setFormState((prev) => ({ ...prev, sortOrder: event.target.value }))}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Checkbox
            checked={formState.isActive}
            onCheckedChange={(checked) =>
              setFormState((prev) => ({ ...prev, isActive: checked === true }))
            }
          />
          활성화
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Checkbox
            checked={formState.isVisible}
            onCheckedChange={(checked) =>
              setFormState((prev) => ({ ...prev, isVisible: checked === true }))
            }
          />
          노출
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Checkbox
            checked={formState.isMainExposed}
            onCheckedChange={(checked) =>
              setFormState((prev) => ({ ...prev, isMainExposed: checked === true }))
            }
          />
          메인 노출
        </label>

        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? '생성 중...' : '카테고리 생성'}
          </Button>
        </div>
      </form>
    </section>
  );
}
