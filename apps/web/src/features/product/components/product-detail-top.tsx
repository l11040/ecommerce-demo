'use client';

import { useMemo } from 'react';
import { ProductImageCarousel } from './product-image-carousel';
import { ProductInfoPanel } from './product-info-panel';
import { ProductOrderDrawer } from './product-order-drawer';
import { ProductDetailContent } from './product-detail-content';
import { useProductQuote } from '../hooks/use-product-quote';
import type { ProductDetail } from '../types';
import { Separator } from '@/components/ui/separator';

interface ProductDetailTopProps {
  product: ProductDetail;
}

export function ProductDetailTop({ product }: ProductDetailTopProps) {
  const {
    quantity,
    setQuantity,
    selectedOptions,
    handleOptionChange,
    quote,
    isLoading,
  } = useProductQuote({ product });

  const allRequiredOptionsSelected = useMemo(() => {
    const requiredGroups = product.optionGroups.filter((g) => g.isRequired);
    return requiredGroups.every((g) => selectedOptions[g.id] != null);
  }, [product.optionGroups, selectedOptions]);

  return (
    <>
      <section className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 pb-8 md:grid-cols-2 md:gap-8 md:px-6 md:py-8">
        {/* 좌측: 이미지 캐러셀 */}
        <ProductImageCarousel
          media={product.media}
          thumbnailUrl={product.thumbnailUrl}
          productName={product.name}
        />

        {/* 우측: 상품 정보 */}
        <ProductInfoPanel
          product={product}
          quantity={quantity}
          selectedOptions={selectedOptions}
          quote={quote}
          isQuoteLoading={isLoading}
          allRequiredOptionsSelected={allRequiredOptionsSelected}
          onQuantityChange={setQuantity}
          onOptionChange={handleOptionChange}
        />
      </section>

      <div className="mx-auto w-full max-w-5xl px-0 md:px-6">
        <Separator />
      </div>

      <ProductDetailContent product={product} />

      {/* 모바일 하단 고정 바 + Drawer */}
      <ProductOrderDrawer
        product={product}
        quantity={quantity}
        selectedOptions={selectedOptions}
        quote={quote}
        isQuoteLoading={isLoading}
        allRequiredOptionsSelected={allRequiredOptionsSelected}
        onQuantityChange={setQuantity}
        onOptionChange={handleOptionChange}
      />
    </>
  );
}
