'use client';

import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductOptionSelector } from './product-option-selector';
import { ProductQuantityInput } from './product-quantity-input';
import type { ProductDetail, QuoteResult } from '../types';

interface ProductOrderDrawerProps {
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

export function ProductOrderDrawer({
  product,
  quantity,
  selectedOptions,
  quote,
  isQuoteLoading,
  allRequiredOptionsSelected,
  onQuantityChange,
  onOptionChange,
}: ProductOrderDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background p-4 md:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {!allRequiredOptionsSelected ? (
            <p className="text-sm text-muted-foreground">
              옵션을 선택해주세요
            </p>
          ) : isQuoteLoading || !quote ? (
            <div className="space-y-1">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold text-primary">
                {formatPrice(quote.totalAmount)}원
              </p>
              <p className="text-xs text-muted-foreground">
                {quote.quantity.toLocaleString('ko-KR')}개 · 단가{' '}
                {formatPrice(quote.unitPrice)}원
              </p>
            </div>
          )}
        </div>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button size="lg">주문하기</Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle>주문 옵션</DrawerTitle>
            </DrawerHeader>

            <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
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
                  {isQuoteLoading || !quote ? (
                    <div className="space-y-2">
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
                  ) : (
                    <div className="space-y-2">
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
                          <span className="text-muted-foreground">VAT</span>
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
                  )}
                </>
              )}

              <Button size="lg" className="w-full">
                장바구니 담기
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
