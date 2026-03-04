import { ProductDetailPage } from '@/features/admin/components/product-detail-page';

export default async function ProductDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">잘못된 상품 ID입니다.</p>
      </div>
    );
  }

  return <ProductDetailPage productId={productId} />;
}
