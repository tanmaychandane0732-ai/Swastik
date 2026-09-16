/**
 * Format numbers as Indian Rupee currency (₹)
 */
export function formatCurrency(amount: number, showSign: boolean = false): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with Indian numbering system (lakhs/crores) or standard commas
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(absAmount);

  if (showSign) {
    if (amount > 0) return `+₹${formatted}`;
    if (amount < 0) return `-₹${formatted}`;
    return `₹${formatted}`;
  }

  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatScore(score: number): string {
  return new Intl.NumberFormat('en-IN').format(score);
}

