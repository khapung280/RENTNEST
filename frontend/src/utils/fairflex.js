/**
 * FairFlex Rent Calculator Utility
 * 
 * Calculates adjusted rent based on rental duration:
 * - 1-2 months: +10% (short-term premium)
 * - 3-5 months: 0% (standard rate)
 * - 6-12 months: -10% (long-term discount)
 * 
 * @param {number} baseRent - Base monthly rent amount
 * @param {number} duration - Rental duration in months (1-12)
 * @returns {object} - { adjustment: number, finalPrice: number }
 */
export const fairflexPrice = (baseRent, duration) => {
  const base = parseFloat(baseRent) || 0
  const months = parseInt(duration) || 1

  let adjustment = 0

  if (months >= 1 && months <= 2) {
    adjustment = 10 // +10%
  } else if (months >= 3 && months <= 5) {
    adjustment = 0 // 0%
  } else if (months >= 6 && months <= 12) {
    adjustment = -10 // -10%
  }

  const finalPrice = base * (1 + adjustment / 100)

  return {
    adjustment,
    finalPrice: parseFloat(finalPrice.toFixed(2)),
  }
}

