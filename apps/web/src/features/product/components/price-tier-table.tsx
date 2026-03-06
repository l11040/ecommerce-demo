'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
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
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const tierHeaderRefs = useRef<Array<HTMLTableCellElement | null>>([]);

  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // SSR/CSR hydration을 맞추기 위해 초기 렌더는 항상 비회원 기준으로 고정한다.
  const authResolved = hydrated ? isAuthenticated : false;
  const tiers = authResolved ? priceTiers.member : priceTiers.guest;
  const sorted = [...(tiers ?? [])].sort((a, b) => a.minQty - b.minQty);
  const activeIndex = findActiveTierIndex(sorted, quantity);

  useEffect(() => {
    if (activeIndex < 0) return;
    const target = tierHeaderRefs.current[activeIndex];
    if (!target) return;
    target.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeIndex, authResolved]);

  if (sorted.length === 0) return null;

  const scrollByPage = (direction: -1 | 1) => {
    const container = tableScrollRef.current;
    if (!container) return;
    const step = Math.max(240, Math.floor(container.clientWidth * 0.8));
    container.scrollBy({
      left: step * direction,
      behavior: 'smooth',
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">수량별 단가</h3>
        {sorted.length > 1 ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-7"
              onClick={() => scrollByPage(-1)}
              aria-label="이전 수량 구간"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-7"
              onClick={() => scrollByPage(1)}
              aria-label="다음 수량 구간"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
      <div
        ref={tableScrollRef}
        className="overflow-x-auto rounded-lg border [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <table className="w-max min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted">
              <th className="sticky left-0 z-20 min-w-[88px] border-r bg-muted px-3 py-2 text-center font-medium relative after:pointer-events-none after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border">
                수량
              </th>
              {sorted.map((tier, index) => (
                <th
                  key={tier.id}
                  ref={(element) => {
                    tierHeaderRefs.current[index] = element;
                  }}
                  className={cn(
                    'min-w-[112px] border-r px-3 py-2 text-center font-medium last:border-r-0',
                    activeIndex === index && 'bg-primary/10 text-primary',
                  )}
                >
                  {tier.minQty.toLocaleString()}개
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="sticky left-0 z-10 min-w-[88px] border-r bg-background px-3 py-2 text-center font-medium relative after:pointer-events-none after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-border">
                단가
              </th>
              {sorted.map((tier, index) => (
                <td
                  key={tier.id}
                  className={cn(
                    'min-w-[112px] border-r px-3 py-2 text-center last:border-r-0',
                    activeIndex === index && 'bg-primary/5 font-semibold',
                  )}
                >
                  {formatPrice(tier.unitPrice)}원
                </td>
              ))}
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
