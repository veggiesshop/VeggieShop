export function formatCurrency(priceCents) {
  const price = parseFloat(priceCents).toFixed(2);
  return `₱${price}`; // Add the PHP symbol before the price
}

export default formatCurrency;