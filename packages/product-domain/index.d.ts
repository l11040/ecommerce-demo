export class ProductQuoteRuleError extends Error {
  constructor(code: string, message: string);
  code: string;
}

export interface PriceTierInput {
  id?: number;
  minQty: number;
  marginRate?: number;
  unitPrice: number;
}

export interface ShippingTierInput {
  id?: number;
  minQty: number;
  shippingFee: number;
}

export interface ProductQuoteInput {
  quantity: number;
  moq: number;
  moqInquiryOnly: boolean;
  vatType: 'exclusive' | 'inclusive';
  vatRate: number;
  baseUnitPrice: number;
  baseSupplyCost: number;
  optionExtraUnitPrice?: number;
  optionExtraSupplyCost?: number;
  priceTiers: PriceTierInput[];
  shippingTiers?: ShippingTierInput[];
}

export interface ProductQuoteResult {
  quantity: number;
  moq: number;
  vatType: 'exclusive' | 'inclusive';
  vatRate: number;
  appliedTier: {
    id: number | null;
    minQty: number;
    marginRate: number | null;
    unitPrice: number;
  };
  optionAdjustmentUnitPrice: number;
  optionAdjustmentSupplyCost: number;
  unitPrice: number;
  supplyUnitCost: number;
  supplyTotal: number;
  subtotalExVat: number;
  vatAmount: number;
  shippingFee: number;
  totalAmount: number;
  estimatedMargin: number;
}

export function pickQuantityTier<T extends { minQty: number }>(
  tiers: T[],
  quantity: number,
): T | null;

export function roundCurrency(value: number): number;

export function calculateProductQuote(input: ProductQuoteInput): ProductQuoteResult;
