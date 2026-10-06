export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '';
  return `Rs ${parseFloat(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
