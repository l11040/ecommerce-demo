export interface PriceTier {
  id: number;
  minQty: number;
  marginRate: number;
  unitPrice: number;
}

export interface PriceTiers {
  guest: PriceTier[];
  member: PriceTier[];
}

export interface OptionItem {
  id: number;
  label: string;
  extraSupplyCost: number;
  extraUnitPrice: number;
  sortOrder: number;
  isActive: boolean;
}

export interface OptionGroup {
  id: number;
  name: string;
  isRequired: boolean;
  selectionType: string;
  sortOrder: number;
  items: OptionItem[];
}

export interface ProductMedia {
  id: number;
  type: string;
  sourceType: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductDetail {
  id: number;
  storeId: number;
  categoryId: number | null;
  name: string;
  slug: string;
  status: string;
  isVisible: boolean;
  moq: number;
  moqInquiryOnly: boolean;
  baseSupplyCost: number;
  vatType: string;
  vatRate: number;
  isPrintable: boolean;
  printMethod: string | null;
  printArea: string | null;
  proofLeadTimeDays: number | null;
  thumbnailUrl: string | null;
  media: ProductMedia[];
  descriptionHtml: string;
  tags: string[];
  searchAliases: string[];
  optionGroups: OptionGroup[];
  priceTiers: PriceTiers;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteResult {
  target: string;
  productId: number;
  productName: string;
  customerSegment: string;
  quantity: number;
  moq: number;
  vatType: string;
  vatRate: number;
  appliedTier: {
    id: number;
    minQty: number;
    marginRate: number;
    unitPrice: number;
  };
  selectedOptionItemIds: number[];
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
