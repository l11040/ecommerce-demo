'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { quoteProduct } from '@/api/fo';
import type { QuoteProduct200 } from '@/api/fo';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { QuoteResult, ProductDetail } from '../types';

interface UseProductQuoteOptions {
  product: ProductDetail;
}

export function useProductQuote({ product }: UseProductQuoteOptions) {
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(product.moq);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const optionsKey = useMemo(
    () => JSON.stringify(selectedOptions),
    [selectedOptions],
  );
  const customerSegment = isAuthenticated ? 'member' : 'guest';

  const fetchQuote = useCallback(async () => {
    if (product.moqInquiryOnly) return;

    const itemIds = Object.values(JSON.parse(optionsKey) as Record<string, number>);

    setIsLoading(true);
    try {
      const result = (await quoteProduct(product.id, {
        quantity,
        customerSegment: customerSegment as 'guest' | 'member',
        selectedOptionItemIds: itemIds.length > 0 ? itemIds : undefined,
      })) as unknown as QuoteProduct200;

      if (result.success) {
        setQuote(result.data as unknown as QuoteResult);
      }
    } catch {
      // 견적 요청 실패 시 무시
    } finally {
      setIsLoading(false);
    }
  }, [product.id, product.moqInquiryOnly, quantity, customerSegment, optionsKey]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchQuote, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchQuote]);

  const handleOptionChange = useCallback(
    (groupId: number, itemId: number) => {
      setSelectedOptions((prev) => ({ ...prev, [groupId]: itemId }));
    },
    [],
  );

  return {
    quantity,
    setQuantity,
    selectedOptions,
    handleOptionChange,
    quote,
    isLoading,
  };
}
