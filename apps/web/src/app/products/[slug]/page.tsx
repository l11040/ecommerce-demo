import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductDetailTop } from '@/features/product/components/product-detail-top';
import type { ProductDetail } from '@/features/product/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:40003';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    const res = await fetch(`${API_URL}/fo/products/${slug}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return json.data as ProductDetail;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: '상품을 찾을 수 없습니다' };

  return {
    title: product.name,
    description: product.name,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return <ProductDetailTop product={product} />;
}
