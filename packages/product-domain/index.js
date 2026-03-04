class ProductQuoteRuleError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = 'ProductQuoteRuleError';
    this.code = code;
  }
}

/**
 * @template T
 * @param {Array<T & { minQty: number }>} tiers
 * @param {number} quantity
 * @returns {(T & { minQty: number }) | null}
 */
function pickQuantityTier(tiers, quantity) {
  let matched = null;

  for (const tier of tiers) {
    if (tier.minQty <= quantity) {
      matched = tier;
    }
  }

  return matched;
}

/**
 * @param {number} value
 * @returns {number}
 */
function roundCurrency(value) {
  return Math.round(value);
}

/**
 * @typedef {{ id?: number; minQty: number; marginRate?: number; unitPrice: number }} PriceTierInput
 * @typedef {{ id?: number; minQty: number; shippingFee: number }} ShippingTierInput
 * @typedef {{
 *   quantity: number;
 *   moq: number;
 *   moqInquiryOnly: boolean;
 *   vatType: 'exclusive' | 'inclusive';
 *   vatRate: number;
 *   baseUnitPrice: number;
 *   baseSupplyCost: number;
 *   optionExtraUnitPrice?: number;
 *   optionExtraSupplyCost?: number;
 *   priceTiers: PriceTierInput[];
 *   shippingTiers?: ShippingTierInput[];
 * }} ProductQuoteInput
 */

/**
 * @param {ProductQuoteInput} input
 */
function calculateProductQuote(input) {
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    throw new ProductQuoteRuleError(
      'PRODUCT_INVALID_QUANTITY',
      'Quantity must be a positive integer',
    );
  }

  if (input.quantity < input.moq) {
    throw new ProductQuoteRuleError(
      input.moqInquiryOnly ? 'PRODUCT_INQUIRY_ONLY' : 'PRODUCT_INVALID_MOQ',
      input.moqInquiryOnly
        ? `Quantity below MOQ (${input.moq}) is inquiry only`
        : `Minimum order quantity is ${input.moq}`,
    );
  }

  const appliedTier = pickQuantityTier(input.priceTiers, input.quantity);

  if (!appliedTier) {
    throw new ProductQuoteRuleError(
      'PRODUCT_PRICE_TIER_INVALID',
      `No price tier matched quantity ${input.quantity}`,
    );
  }

  const shippingTier = pickQuantityTier(input.shippingTiers ?? [], input.quantity);
  const optionExtraUnitPrice = input.optionExtraUnitPrice ?? 0;
  const optionExtraSupplyCost = input.optionExtraSupplyCost ?? 0;
  const unitPrice = appliedTier.unitPrice + optionExtraUnitPrice;
  const supplyUnitCost = input.baseSupplyCost + optionExtraSupplyCost;

  const supplyTotal = roundCurrency(supplyUnitCost * input.quantity);
  const subtotalByVatType = roundCurrency(unitPrice * input.quantity);
  const shippingFee = shippingTier ? roundCurrency(shippingTier.shippingFee) : 0;

  const subtotalExVat =
    input.vatType === 'inclusive'
      ? roundCurrency(subtotalByVatType / (1 + input.vatRate / 100))
      : subtotalByVatType;

  const vatAmount =
    input.vatType === 'inclusive'
      ? roundCurrency(subtotalByVatType - subtotalExVat)
      : roundCurrency(subtotalExVat * (input.vatRate / 100));

  const totalAmount =
    input.vatType === 'inclusive'
      ? subtotalByVatType + shippingFee
      : subtotalExVat + vatAmount + shippingFee;

  return {
    quantity: input.quantity,
    moq: input.moq,
    vatType: input.vatType,
    vatRate: input.vatRate,
    appliedTier: {
      id: appliedTier.id ?? null,
      minQty: appliedTier.minQty,
      marginRate: appliedTier.marginRate ?? null,
      unitPrice: appliedTier.unitPrice,
    },
    optionAdjustmentUnitPrice: roundCurrency(optionExtraUnitPrice),
    optionAdjustmentSupplyCost: roundCurrency(optionExtraSupplyCost),
    unitPrice: roundCurrency(unitPrice),
    supplyUnitCost: roundCurrency(supplyUnitCost),
    supplyTotal,
    subtotalExVat,
    vatAmount,
    shippingFee,
    totalAmount,
    estimatedMargin: roundCurrency(subtotalExVat - supplyTotal),
  };
}

module.exports = {
  ProductQuoteRuleError,
  calculateProductQuote,
  pickQuantityTier,
  roundCurrency,
};
