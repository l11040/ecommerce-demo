'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { _delete as deleteCategory, list, update, type List200DataItem, type UpdateCategoryDto } from '@/api/bo';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type CategoryEditFormState = {
  parentId: string;
  name: string;
  slug: string;
  sortOrder: string;
  isActive: boolean;
  isVisible: boolean;
  isMainExposed: boolean;
};

const noneParentValue = '__none__';

function toFormState(category: List200DataItem): CategoryEditFormState {
  return {
    parentId: category.parentId === null ? noneParentValue : String(category.parentId),
    name: category.name,
    slug: category.slug,
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
    isVisible: category.isVisible,
    isMainExposed: category.isMainExposed,
  };
}

function CategoryEditForm({
  category,
  categories,
}: {
  category: List200DataItem;
  categories: List200DataItem[];
}) {
  const router = useRouter();
  const [formState, setFormState] = useState<CategoryEditFormState>(() => toFormState(category));
  const [pending, setPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const unavailableParentIds = useMemo(() => {
    const ids = new Set<number>([category.id]);
    for (const candidate of categories) {
      if (candidate.path.startsWith(`${category.path}.`)) {
        ids.add(candidate.id);
      }
    }
    return ids;
  }, [categories, category.id, category.path]);

  const subtreeDepthOffset = useMemo(
    () =>
      categories.reduce((maxOffset, candidate) => {
        if (!candidate.path.startsWith(`${category.path}.`)) {
          return maxOffset;
        }
        return Math.max(maxOffset, candidate.depth - category.depth);
      }, 0),
    [categories, category.depth, category.path],
  );

  const availableParents = useMemo(
    () =>
      categories.filter(
        (candidate) =>
          !unavailableParentIds.has(candidate.id) &&
          candidate.depth + subtreeDepthOffset <= 4,
      ),
    [categories, subtreeDepthOffset, unavailableParentIds],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);

    const payload: UpdateCategoryDto = {
      parentId:
        formState.parentId === noneParentValue
          ? null
          : Number(formState.parentId),
      name: formState.name.trim(),
      slug: formState.slug.trim(),
      sortOrder: Number(formState.sortOrder || '0'),
      isActive: formState.isActive,
      isVisible: formState.isVisible,
      isMainExposed: formState.isMainExposed,
    };

    const response = await update(category.id, payload);
    if (response.status !== 200 || !response.data.success) {
      toast.error('카테고리 수정 실패', {
        description: response.data.message ?? '카테고리 수정에 실패했습니다.',
      });
      setPending(false);
      return;
    }

    toast.success(`카테고리 #${category.id} 저장 완료`);
    setPending(false);
    router.push('/categories');
  }

  async function handleDeleteCategory() {
    setDeletePending(true);

    const response = await deleteCategory(category.id);
    if (response.status !== 200 || !response.data.success) {
      toast.error('카테고리 삭제 실패', {
        description: response.data.message ?? '카테고리 삭제에 실패했습니다.',
      });
      setDeletePending(false);
      return;
    }

    toast.success(`카테고리 #${category.id} 삭제 완료`);
    setDeletePending(false);
    setDeleteConfirmOpen(false);
    router.push('/categories');
  }

  return (
    <>
      <form className="contents" onSubmit={handleSubmit}>
        <p className="text-xs text-slate-500 md:col-span-2">
          ID {category.id} / depth {category.depth} / path {category.path}
        </p>

        <label className="space-y-1">
          <span className="text-xs font-semibold text-slate-500">상위 카테고리</span>
          <Select
            value={formState.parentId}
            onValueChange={(value) =>
              setFormState((prev) => ({ ...prev, parentId: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="없음 (depth 1)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={noneParentValue}>없음 (depth 1)</SelectItem>
              {availableParents.map((candidate) => (
                <SelectItem key={candidate.id} value={String(candidate.id)}>
                  [{candidate.depth}] {candidate.name} ({candidate.path})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

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
          <span className="text-xs font-semibold text-slate-500">정렬 순서</span>
          <input
            type="number"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none ring-cyan-400 focus:ring-2"
            value={formState.sortOrder}
            onChange={(event) => setFormState((prev) => ({ ...prev, sortOrder: event.target.value }))}
          />
        </label>

        <div className="flex flex-wrap items-center gap-4 text-sm md:col-span-2">
          <label className="flex items-center gap-2 text-slate-700">
            <Checkbox
              checked={formState.isActive}
              onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isActive: checked === true }))}
            />
            활성화
          </label>

          <label className="flex items-center gap-2 text-slate-700">
            <Checkbox
              checked={formState.isVisible}
              onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, isVisible: checked === true }))}
            />
            노출
          </label>

          <label className="flex items-center gap-2 text-slate-700">
            <Checkbox
              checked={formState.isMainExposed}
              onCheckedChange={(checked) =>
                setFormState((prev) => ({
                  ...prev,
                  isMainExposed: checked === true,
                }))
              }
            />
            메인 노출
          </label>
        </div>

        <div className="flex items-center justify-between gap-2 md:col-span-2">
          <Button type="button" variant="destructive" onClick={() => setDeleteConfirmOpen(true)} disabled={deletePending}>
            {deletePending ? '삭제 중...' : '삭제'}
          </Button>
          <div className="flex items-center gap-2">
            <Button asChild type="button" variant="outline">
              <Link href="/categories">취소</Link>
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </form>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카테고리를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 카테고리는 복구할 수 없습니다. 하위 카테고리가 있으면 삭제가 실패합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 text-white hover:bg-rose-700"
              disabled={deletePending}
              onClick={() => void handleDeleteCategory()}
            >
              {deletePending ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function CategoryEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id') ?? '';

  const [categories, setCategories] = useState<List200DataItem[]>([]);
  const [categoriesError, setCategoriesError] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const response = await list();
        if (response.status !== 200 || !response.data.success) {
          const msg = response.data.message ?? '카테고리 목록을 불러오지 못했습니다.';
          setCategoriesError(msg);
          toast.error('카테고리 목록 조회 실패', { description: msg });
          return;
        }

        const sorted = [...response.data.data].sort((a, b) => a.path.localeCompare(b.path, 'ko'));
        setCategories(sorted);
      })();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === selectedId) ?? null,
    [categories, selectedId],
  );

  function handleSelectCategory(nextValue: string) {
    router.replace(`/categories/edit?id=${nextValue}`);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">카테고리 수정</h2>
          <p className="mt-1 text-sm text-slate-500">목록에서 선택한 카테고리를 페이지에서 수정합니다.</p>
        </div>

        <Button asChild type="button" variant="outline">
          <Link href="/categories">
            <ArrowLeft className="size-4" />
            목록으로
          </Link>
        </Button>
      </div>

      {categoriesError ? <p className="mb-3 text-sm font-medium text-rose-500">{categoriesError}</p> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-semibold text-slate-500">수정 대상 카테고리</span>
          <Select value={selectedId} onValueChange={handleSelectCategory}>
            <SelectTrigger>
              <SelectValue placeholder="수정할 카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  [{category.depth}] {category.name} ({category.path})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        {selectedCategory ? (
          <CategoryEditForm
            key={selectedCategory.id}
            category={selectedCategory}
            categories={categories}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 md:col-span-2">
            수정할 카테고리를 먼저 선택해주세요.
          </div>
        )}
      </div>
    </section>
  );
}
