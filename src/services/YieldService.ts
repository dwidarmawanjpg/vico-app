/**
 * YieldService - Utility functions for VCO yield calculations
 * Based on SOP parameters:
 * - 1 kg (1000g) coconut yields approx 100-120 mL VCO
 * - Efficiency is calculated as outputVolume / (inputWeight * 0.1) * 100
 */

// Yield constants based on VCO production SOP
const MIN_YIELD_RATIO = 0.10;  // 100mL per 1000g = 0.1 mL/g
const MAX_YIELD_RATIO = 0.12;  // 120mL per 1000g = 0.12 mL/g
const STANDARD_YIELD = 0.10;   // Expected standard yield

export const YieldService = {
  /**
   * Calculate expected yield range from input weight
   * @param inputWeight in grams
   * @returns { min, max } in mL
   */
  getExpectedYield(inputWeight: number): { min: number; max: number } {
    return {
      min: Math.floor(inputWeight * MIN_YIELD_RATIO),
      max: Math.floor(inputWeight * MAX_YIELD_RATIO),
    };
  },

  /**
   * Calculate efficiency percentage
   * @param outputVolume actual output in mL
   * @param inputWeight input coconut in grams
   * @returns efficiency as percentage (0-100+)
   */
  calculateEfficiency(outputVolume: number, inputWeight: number): number {
    if (inputWeight <= 0) return 0;
    
    const expectedOutput = inputWeight * STANDARD_YIELD;
    const efficiency = (outputVolume / expectedOutput) * 100;
    
    return Math.round(efficiency * 10) / 10; // Round to 1 decimal
  },

  /**
   * Get quality rating based on efficiency
   * @param efficiency percentage
   * @returns quality rating string
   */
  getQualityRating(efficiency: number): 'Premium' | 'Standard' | 'Below Standard' | 'Poor' {
    if (efficiency >= 110) return 'Premium';
    if (efficiency >= 90) return 'Standard';
    if (efficiency >= 70) return 'Below Standard';
    return 'Poor';
  },

  /**
   * Calculate required coconut weight for target VCO output
   * @param targetVolume desired output in mL
   * @returns required coconut weight in grams
   */
  getRequiredInput(targetVolume: number): number {
    return Math.ceil(targetVolume / STANDARD_YIELD);
  },

  /**
   * Calculate required water volume
   * 1:1 ratio - 1kg coconut needs 1L water
   * @param inputWeight coconut weight in grams
   * @returns water volume in liters
   */
  getRequiredWater(inputWeight: number): number {
    return inputWeight / 1000;
  },

  /**
   * Format efficiency with quality indicator
   */
  formatEfficiency(efficiency: number): string {
    const rating = this.getQualityRating(efficiency);
    return `${efficiency.toFixed(1)}% (${rating})`;
  },
};
