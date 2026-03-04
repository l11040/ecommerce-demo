'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OptionGroup } from '../types';

interface ProductOptionSelectorProps {
  optionGroups: OptionGroup[];
  selectedOptions: Record<number, number>;
  onOptionChange: (groupId: number, itemId: number) => void;
}

function formatExtra(price: number) {
  if (price === 0) return '';
  const sign = price > 0 ? '+' : '';
  return ` (${sign}${price.toLocaleString('ko-KR')}원)`;
}

export function ProductOptionSelector({
  optionGroups,
  selectedOptions,
  onOptionChange,
}: ProductOptionSelectorProps) {
  if (optionGroups.length === 0) return null;

  const sorted = [...optionGroups].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-3">
      {sorted.map((group) => {
        const activeItems = group.items
          .filter((item) => item.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        return (
          <div key={group.id} className="space-y-1.5">
            <label className="text-sm font-medium">
              {group.name}
              {group.isRequired && (
                <span className="ml-1 text-destructive">*</span>
              )}
            </label>
            <Select
              value={
                selectedOptions[group.id] !== undefined
                  ? String(selectedOptions[group.id])
                  : undefined
              }
              onValueChange={(value) => onOptionChange(group.id, Number(value))}
            >
              <SelectTrigger size="lg" className="w-full">
                <SelectValue placeholder="선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {activeItems.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.label}
                    {formatExtra(item.extraUnitPrice)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
