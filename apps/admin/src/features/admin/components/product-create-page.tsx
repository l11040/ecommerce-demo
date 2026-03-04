'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createProduct, list as listCategories, type List200DataItem } from '@/api/bo';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api-response';
import { uploadProductImageFile } from '@/lib/upload';
import { toast } from 'sonner';
import {
  buildCreatePayload,
  defaultProductFormState,
  ProductFormFields,
  type ProductFormState,
} from './product-form-fields';

export function ProductCreatePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<List200DataItem[]>([]);
  const [form, setForm] = useState<ProductFormState>(defaultProductFormState);
  const [pending, setPending] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.path.localeCompare(b.path, 'ko')),
    [categories],
  );

  const loadCategories = useCallback(async () => {
    const response = await listCategories();
    if (response.status === 200 && response.data.success) {
      setCategories(response.data.data);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const response = await createProduct(buildCreatePayload(form));

    if (response.status !== 200 || !response.data.success) {
      toast.error('상품 생성 실패', {
        description: getApiErrorMessage(response, '상품 생성에 실패했습니다.'),
      });
      setPending(false);
      return;
    }

    toast.success('상품 생성 완료');
    router.push('/products');
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

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-lg font-bold">상품 생성</h2>
          <p className="mt-1 text-sm text-slate-500">상품 기본 정보를 입력해 신규 상품을 생성합니다.</p>
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
          <Button type="button" variant="outline" onClick={() => router.push('/products')} disabled={pending}>
            취소
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? '생성 중...' : '생성'}
          </Button>
        </div>
      </form>
    </section>
  );
}
