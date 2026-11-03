import { applyRate, assertCents, type Cents } from "./money.ts";

export type Discount =
  { readonly kind: "percent"; readonly percent: number } | { readonly kind: "fixed"; readonly amount: Cents };

export class DiscountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DiscountError";
  }
}

/** The discount codes customers can type at checkout. */
export const DISCOUNT_CODES: Readonly<Record<string, Discount>> = {
  SAVE10: { kind: "percent", percent: 10 },
  SAVE25: { kind: "percent", percent: 25 },
  MINUS20: { kind: "fixed", amount: 2000 },
};

/** Customers may type any letter case and stray whitespace; the canonical code is upper case. */
export function lookupDiscount(code: string): Discount {
  const canonical = code.trim().toUpperCase();
  // hasOwn, not a property read: `constructor` and `toString` are inherited, not discount codes.
  if (!Object.hasOwn(DISCOUNT_CODES, canonical)) {
    throw new DiscountError(`Unknown discount code: "${code}"`);
  }
  return DISCOUNT_CODES[canonical] as Discount;
}

/** Returns how many cents a discount takes off a subtotal. Never more than the subtotal. */
export function discountAmount(subtotal: Cents, discount: Discount): Cents {
  assertCents(subtotal);
  const raw = discount.kind === "percent" ? applyRate(subtotal, discount.percent / 100) : discount.amount;
  return Math.min(raw, subtotal);
}
