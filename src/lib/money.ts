/** Round to nearest cent (half-up via Number.EPSILON-safe cents). */
export function roundToCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/** Format USD the same way checkout / cart UI does. */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(roundToCents(amount));
}

/**
 * Convert dollars → Stripe integer cents without floating-point drift
 * (e.g. 19.99 * 100 === 1998.999... without rounding).
 */
export function toStripeCents(amount: number): number {
  return Math.round(roundToCents(amount) * 100);
}
