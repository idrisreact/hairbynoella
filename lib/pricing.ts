/**
 * Pricing utilities for deposit calculation and price parsing
 *
 * Deposit Strategy: 30% of service price with £20 minimum floor
 */

const DEPOSIT_PERCENTAGE = 0.3;
const MINIMUM_DEPOSIT_PENCE = 2000; // £20.00

/**
 * Parse service price string and extract base price in pence
 *
 * Handles formats:
 * - "£80" → 8000 pence
 * - "From £45" → 4500 pence
 * - "£120-£150" → 12000 pence (takes lower bound)
 * - "Free" → 0 pence (will use minimum deposit)
 *
 * @param priceString - The price string from the service
 * @returns Price in pence (integer)
 */
export function parseServicePrice(priceString: string): number {
  // Handle "Free" case
  if (priceString.toLowerCase().includes('free')) {
    return 0;
  }

  // Remove "From " prefix if present
  let cleanPrice = priceString.replace(/from\s+/i, '');

  // Handle price ranges: "£120-£150" → take the first price
  if (cleanPrice.includes('-')) {
    cleanPrice = cleanPrice.split('-')[0];
  }

  // Extract numeric value: "£80" → "80"
  const match = cleanPrice.match(/£?(\d+(?:\.\d{2})?)/);

  if (!match) {
    // If no valid price found, default to minimum deposit amount
    return MINIMUM_DEPOSIT_PENCE;
  }

  const priceInPounds = parseFloat(match[1]);

  // Convert pounds to pence (multiply by 100)
  return Math.round(priceInPounds * 100);
}

/**
 * Calculate deposit amount based on service price
 *
 * Rule: 30% of service price, minimum £20
 *
 * @param servicePriceInPence - Full service price in pence
 * @returns Deposit amount in pence (integer)
 */
export function calculateDeposit(servicePriceInPence: number): number {
  // Calculate 30% of the service price
  const calculatedDeposit = Math.round(servicePriceInPence * DEPOSIT_PERCENTAGE);

  // Ensure minimum deposit of £20
  return Math.max(calculatedDeposit, MINIMUM_DEPOSIT_PENCE);
}

/**
 * Format price in pence to currency string
 *
 * @param pence - Amount in pence
 * @returns Formatted price string (e.g., "£20.00")
 */
export function formatPrice(pence: number): string {
  const pounds = pence / 100;
  return `£${pounds.toFixed(2)}`;
}

/**
 * Calculate remaining balance after deposit
 *
 * @param servicePriceInPence - Full service price in pence
 * @param depositInPence - Deposit amount in pence
 * @returns Remaining balance in pence
 */
export function calculateRemainingBalance(
  servicePriceInPence: number,
  depositInPence: number
): number {
  return servicePriceInPence - depositInPence;
}

/**
 * Get full price breakdown for a service
 *
 * @param priceString - The price string from the service
 * @returns Object with all price calculations
 */
export function getPriceBreakdown(priceString: string) {
  const servicePriceInPence = parseServicePrice(priceString);
  const depositInPence = calculateDeposit(servicePriceInPence);
  const remainingBalanceInPence = calculateRemainingBalance(
    servicePriceInPence,
    depositInPence
  );

  return {
    servicePriceInPence,
    depositInPence,
    remainingBalanceInPence,
    servicePrice: formatPrice(servicePriceInPence),
    deposit: formatPrice(depositInPence),
    remainingBalance: formatPrice(remainingBalanceInPence),
  };
}
