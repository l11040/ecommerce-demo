'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductQuantityInputProps {
  quantity: number;
  moq: number;
  moqInquiryOnly: boolean;
  onQuantityChange: (quantity: number) => void;
}

export function ProductQuantityInput({
  quantity,
  moq,
  moqInquiryOnly,
  onQuantityChange,
}: ProductQuantityInputProps) {
  const [draftQuantity, setDraftQuantity] = useState(String(quantity));

  useEffect(() => {
    setDraftQuantity(String(quantity));
  }, [quantity]);

  if (moqInquiryOnly) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium">수량</label>
        <p className="text-sm text-muted-foreground">
          별도 문의가 필요한 상품입니다.
        </p>
      </div>
    );
  }

  const handleDecrease = () => {
    const next = quantity - 1;
    if (next >= moq) {
      onQuantityChange(next);
      setDraftQuantity(String(next));
    }
  };

  const handleIncrease = () => {
    const next = quantity + 1;
    onQuantityChange(next);
    setDraftQuantity(String(next));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setDraftQuantity(value);
  };

  const commitDraftQuantity = () => {
    const parsed = Number(draftQuantity);
    const next =
      Number.isInteger(parsed) && parsed >= moq ? parsed : moq;

    if (next !== quantity) {
      onQuantityChange(next);
    }
    setDraftQuantity(String(next));
  };

  const handleBlur = () => {
    commitDraftQuantity();
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        수량 <span className="text-muted-foreground">(최소 {moq.toLocaleString('ko-KR')}개)</span>
      </label>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleDecrease}
          disabled={quantity <= moq}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="text"
          inputMode="numeric"
          value={draftQuantity}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              (event.currentTarget as HTMLInputElement).blur();
            }
          }}
          className="h-9 w-20 text-center"
        />
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleIncrease}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
