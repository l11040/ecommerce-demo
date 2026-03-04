'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  list as listCategories,
  listProducts,
  updateProduct,
  type List200DataItem,
  type ListProducts200DataItem,
} from '@/api/bo';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api-response';
import { uploadProductImageFile } from '@/lib/upload';
import { toast } from 'sonner';
import {
  buildUpdatePayload,
  defaultProductFormState,
  ProductFormFields,
  toProductFormState,
  type ProductFormState,
} from './product-form-fields';

export function ProductEditPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('id') ? Number(searchParams.get('id')) : null;

  const [categories, setCategories] = useState<List200DataItem[]>([]);
  const [products, setProducts] = useState<ListProducts200DataItem[]>([]);
  const [form, setForm] = useState<ProductFormState>(defaultProductFormState);
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.path.localeCompare(b.path, 'ko')),
    [categories],
  );

  const loadData = useCallback(async () => {
    const [catRes, prodRes] = await Promise.all([listCategories(), listProducts()]);

    if (catRes.status === 200 && catRes.data.success) {
      setCategories(catRes.data.data);
    }

    if (prodRes.status === 200 && prodRes.data.success) {
      setProducts(prodRes.data.data);

      if (productId) {
        const target = prodRes.data.data.find((p) => p.id === productId);
        if (target) {
          setForm(toProductFormState(target));
        }
      }
    }

    setLoaded(true);
  }, [productId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const currentProduct = products.find((p) => p.id === productId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productId) return;

    setPending(true);

    const response = await updateProduct(productId, buildUpdatePayload(form));

    if (response.status !== 200 || !response.data.success) {
      toast.error('상품 수정 실패', {
        description: getApiErrorMessage(response, '상품 수정에 실패했습니다.'),
      });
      setPending(false);
      return;
    }

    toast.success(`상품 #${productId} 수정 완료`);
    setPending(false);
  }

  async function handleUploadThumbnail(file: File) {
    setThumbnailUploading(true);

    try {
      const uploaded = await uploadProductImageFile(file);
      setForm((prev) => ({ ...prev, thumbnailUrl: uploaded.path }));
      toast.success('썸네일 업로드 완료');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.';
      toast.error('썸네일 업로드 실패', { description: message });
    } finally {
      setThumbnailUploading(false);
    }
  }

  if (!loaded) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">데이터를 불러오는 중입니다...</p>
      </section>
    );
  }

  if (!productId || !currentProduct) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <h2 className="text-lg font-bold">상품 수정</h2>
        </div>
        <p className="text-sm text-slate-500">상품을 찾을 수 없습니다. 목록에서 수정할 상품을 선택해주세요.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-lg font-bold">상품 수정</h2>
          <p className="mt-1 text-sm text-slate-500">
            상품 #{productId} {currentProduct.name} 기본 정보를 수정합니다.
          </p>
        </div>
      </div>

      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
        <ProductFormFields
          formState={form}
          onChange={setForm}
          categories={sortedCategories}
          onUploadThumbnail={handleUploadThumbnail}
          isUploadingThumbnail={thumbnailUploading}
        />
        <div className="flex items-center gap-2 md:col-span-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/products">취소</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </section>
  );
}
