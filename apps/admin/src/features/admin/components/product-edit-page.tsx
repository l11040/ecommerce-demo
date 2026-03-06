'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  list as listCategories,
  listProducts,
  updateProduct,
  type List200DataItem,
  type ListProducts200DataItem,
} from '@/api/bo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { ProductDetailPage } from './product-detail-page';

export function ProductEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id') ?? '';

  const [categories, setCategories] = useState<List200DataItem[]>([]);
  const [products, setProducts] = useState<ListProducts200DataItem[]>([]);
  const [categoriesError, setCategoriesError] = useState('');
  const [productsError, setProductsError] = useState('');
  const [form, setForm] = useState<ProductFormState>(defaultProductFormState);
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.path.localeCompare(b.path, 'ko')),
    [categories],
  );

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => b.id - a.id),
    [products],
  );

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === selectedId) ?? null,
    [products, selectedId],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const [categoriesResponse, productsResponse] = await Promise.all([listCategories(), listProducts()]);

        if (categoriesResponse.status !== 200 || !categoriesResponse.data.success) {
          const message = getApiErrorMessage(
            categoriesResponse,
            '카테고리 목록을 불러오지 못했습니다.',
          );
          setCategoriesError(message);
          toast.error('카테고리 목록 조회 실패', { description: message });
        } else {
          setCategories(categoriesResponse.data.data);
        }

        if (productsResponse.status !== 200 || !productsResponse.data.success) {
          const message = getApiErrorMessage(productsResponse, '상품 목록을 불러오지 못했습니다.');
          setProductsError(message);
          toast.error('상품 목록 조회 실패', { description: message });
        } else {
          setProducts(productsResponse.data.data);
        }

        setLoaded(true);
      })();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      setForm(toProductFormState(selectedProduct));
      return;
    }
    setForm(defaultProductFormState);
  }, [selectedProduct]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProduct) {
      toast.error('수정할 상품을 먼저 선택해주세요.');
      return;
    }

    setPending(true);
    const response = await updateProduct(selectedProduct.id, buildUpdatePayload(form));

    if (response.status !== 200 || !response.data.success) {
      toast.error('상품 기본정보 수정 실패', {
        description: getApiErrorMessage(response, '상품 기본정보 수정에 실패했습니다.'),
      });
      setPending(false);
      return;
    }

    toast.success(`상품 #${selectedProduct.id} 기본정보 저장 완료`);
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

  function handleSelectProduct(nextValue: string) {
    router.replace(`/products/edit?id=${nextValue}`);
  }

  if (!loaded) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">상품 데이터를 불러오는 중입니다...</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">상품 수정</h2>
            <p className="mt-1 text-sm text-slate-500">
              카테고리 수정 페이지처럼 대상 상품을 선택하고 기본정보와 상세 수정보드를 같은 화면에서 관리합니다.
            </p>
          </div>

          <Button asChild type="button" variant="outline">
            <Link href="/products">
              <ArrowLeft className="size-4" />
              목록으로
            </Link>
          </Button>
        </div>

        {categoriesError ? <p className="mb-2 text-sm font-medium text-rose-500">{categoriesError}</p> : null}
        {productsError ? <p className="mb-2 text-sm font-medium text-rose-500">{productsError}</p> : null}

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold text-slate-500">수정 대상 상품</span>
            <Select value={selectedId} onValueChange={handleSelectProduct}>
              <SelectTrigger>
                <SelectValue placeholder="수정할 상품을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {sortedProducts.map((product) => (
                  <SelectItem key={product.id} value={String(product.id)}>
                    #{product.id} {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {selectedProduct ? (
            <form className="contents" onSubmit={handleSubmit}>
              <p className="text-xs text-slate-500 md:col-span-2">
                ID {selectedProduct.id} / 슬러그 {selectedProduct.slug} / 업데이트{' '}
                {new Date(selectedProduct.updatedAt).toLocaleString('ko-KR')}
              </p>
              <ProductFormFields
                formState={form}
                onChange={setForm}
                categories={sortedCategories}
                onUploadThumbnail={handleUploadThumbnail}
                isUploadingThumbnail={thumbnailUploading}
                disableStoreId
              />
              <div className="flex items-center gap-2 md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm(toProductFormState(selectedProduct))}
                  disabled={pending}
                >
                  기본정보 초기화
                </Button>
                <Button type="submit" disabled={pending || thumbnailUploading}>
                  {pending ? '저장 중...' : '기본정보 저장'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 md:col-span-2">
              수정할 상품을 먼저 선택해주세요.
            </div>
          )}
        </div>
      </div>

      {selectedProduct ? <ProductDetailPage key={selectedProduct.id} productId={selectedProduct.id} embedded /> : null}
    </section>
  );
}
