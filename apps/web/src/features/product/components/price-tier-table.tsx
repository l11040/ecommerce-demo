'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { PriceTiers } from '../types';
import { Button } from '@/components/ui/button';

interface PriceTierTableProps {
  priceTiers: PriceTiers;
  quantity: number;
}

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR');
}

function findActiveTierIndex(tiers: { minQty: number }[], quantity: number) {
  let activeIndex = -1;
  for (let i = 0; i < tiers.length; i++) {
    if (quantity >= tiers[i].minQty) {
      activeIndex = i;
    }
  }
  return activeIndex;
}

export function PriceTierTable({ priceTiers, quantity }: PriceTierTableProps) {
  const { isAuthenticated } = useAuth();
  const tiers = isAuthenticated ? priceTiers.member : priceTiers.guest;
  const sorted = [...(tiers ?? [])].sort((a, b) => a.minQty - b.minQty);
  const activeIndex = findActiveTierIndex(sorted, quantity);
  const [windowStart, setWindowStart] = useState(
    activeIndex >= 0 ? Math.max(0, activeIndex - 4) : 0,
  );
  const [visibleCount, setVisibleCount] = useState(5);
  const maxStart = Math.max(0, sorted.length - visibleCount);
  const visibleStart = Math.max(0, Math.min(windowStart, maxStart));
  const visibleTiers = sorted.slice(
    visibleStart,
    visibleStart + visibleCount,
  );

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCount(2);
        return;
      }
      if (width < 1024) {
        setVisibleCount(3);
        return;
      }
      setVisibleCount(5);
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => {
      window.removeEventListener('resize', updateVisibleCount);
    };
  }, []);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">수량별 단가</h3>
        {sorted.length > visibleCount ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-7"
              onClick={() =>
                setWindowStart(Math.max(0, visibleStart - visibleCount))
              }
              disabled={visibleStart <= 0}
              aria-label="이전 수량 구간"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-7"
              onClick={() =>
                setWindowStart(Math.min(maxStart, visibleStart + visibleCount))
              }
              disabled={visibleStart >= maxStart}
              aria-label="다음 수량 구간"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border">
        <table className="min-w-full border-collapse text-sm">
          <tbody>
            <tr className="border-b bg-muted/50">
              <th className="min-w-[88px] border-r px-3 py-2 text-center font-medium">
                수량
              </th>
              {visibleTiers.map((tier, visibleIndex) => {
                const index = visibleStart + visibleIndex;
                return (
                <th
                  key={tier.id}
                  className={cn(
                    'min-w-[96px] border-r px-3 py-2 text-center font-medium last:border-r-0',
                    activeIndex === index && 'bg-primary/10 text-primary',
                  )}
                >
                  {tier.minQty.toLocaleString()}개
                </th>
                );
              })}
            </tr>
            <tr>
              <th className="min-w-[88px] border-r bg-muted/30 px-3 py-2 text-center font-medium">
                단가
              </th>
              {visibleTiers.map((tier, visibleIndex) => {
                const index = visibleStart + visibleIndex;
                return (
                <td
                  key={tier.id}
                  className={cn(
                    'min-w-[96px] border-r px-3 py-2 text-center last:border-r-0',
                    activeIndex === index && 'bg-primary/5 font-semibold',
                  )}
                >
                  {formatPrice(tier.unitPrice)}원
                </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      {!isAuthenticated && (
        <p className="text-xs text-muted-foreground">
          회원가로 구매하려면 로그인하세요.
        </p>
      )}
    </div>
  );
}
