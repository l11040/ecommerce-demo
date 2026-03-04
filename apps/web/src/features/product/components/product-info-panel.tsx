'use client';

import { Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PriceTierTable } from './price-tier-table';
import { ProductOptionSelector } from './product-option-selector';
import { ProductQuantityInput } from './product-quantity-input';
import type { ProductDetail, QuoteResult } from '../types';

interface ProductInfoPanelProps {
  product: ProductDetail;
  quantity: number;
  selectedOptions: Record<number, number>;
  quote: QuoteResult | null;
  isQuoteLoading: boolean;
  allRequiredOptionsSelected: boolean;
  onQuantityChange: (quantity: number) => void;
  onOptionChange: (groupId: number, itemId: number) => void;
}

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR');
}

function QuoteSummary({
  quote,
  isLoading,
  vatType,
}: {
  quote: QuoteResult | null;
  isLoading: boolean;
  vatType: string;
}) {
  if (isLoading || !quote) {
    return (
      <div className="space-y-2 rounded-lg bg-muted/50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">단가</span>
          <Skeleton className="h-3.5 w-20" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">소계</span>
          <Skeleton className="h-3.5 w-24" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">VAT</span>
          <Skeleton className="h-3.5 w-20" />
        </div>
        <Separator />
        <div className="flex items-center justify-between font-semibold">
          <span>총 금액</span>
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg bg-muted/50 p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">단가</span>
        <span>{formatPrice(quote.unitPrice)}원</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          소계 ({quote.quantity.toLocaleString('ko-KR')}개)
        </span>
        <span>{formatPrice(quote.subtotalExVat)}원</span>
      </div>
      {quote.vatAmount > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            VAT ({vatType === 'inclusive' ? '포함' : '별도'})
          </span>
          <span>{formatPrice(quote.vatAmount)}원</span>
        </div>
      )}
      {quote.shippingFee > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">배송비</span>
          <span>{formatPrice(quote.shippingFee)}원</span>
        </div>
      )}
      <Separator />
      <div className="flex items-center justify-between font-semibold">
        <span>총 금액</span>
        <span className="text-lg text-primary">
          {formatPrice(quote.totalAmount)}원
        </span>
      </div>
    </div>
  );
}

export function ProductInfoPanel({
  product,
  quantity,
  selectedOptions,
  quote,
  isQuoteLoading,
  allRequiredOptionsSelected,
  onQuantityChange,
  onOptionChange,
}: ProductInfoPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* 상품명 */}
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.isPrintable && (
            <Badge variant="secondary">
              <Printer className="mr-1 h-3 w-3" />
              인쇄 가능
            </Badge>
          )}
          {product.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* 수량별 단가 테이블 */}
      <PriceTierTable
        key={`price-tier-${quantity}`}
        priceTiers={product.priceTiers}
        quantity={quantity}
      />

      {/* 데스크톱 전용: 옵션 + 수량 + 견적 */}
      <div className="hidden md:flex md:flex-col md:gap-5">
        <Separator />

        {/* 옵션 선택 */}
        <ProductOptionSelector
          optionGroups={product.optionGroups}
          selectedOptions={selectedOptions}
          onOptionChange={onOptionChange}
        />

        {allRequiredOptionsSelected && (
          <>
            {/* 수량 입력 */}
            <ProductQuantityInput
              quantity={quantity}
              moq={product.moq}
              moqInquiryOnly={product.moqInquiryOnly}
              onQuantityChange={onQuantityChange}
            />

            <Separator />

            {/* 견적 결과 */}
            <QuoteSummary
              quote={quote}
              isLoading={isQuoteLoading}
              vatType={product.vatType}
            />
          </>
        )}
      </div>
    </div>
  );
}
