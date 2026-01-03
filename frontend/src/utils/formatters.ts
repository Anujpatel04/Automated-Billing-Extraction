/**
 * Utility functions for formatting data
 */

export const formatCurrency = (amount: string | number, currency: string = 'INR'): string => {
  const numAmount = typeof amount === 'string' 
    ? parseFloat(amount.replace(/[₹$€£¥,]/g, '')) 
    : amount;
  
  if (isNaN(numAmount)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency === 'INR' ? 'INR' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  
  try {
    // Handle DD-MM-YYYY format
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const date = new Date(`${year}-${month}-${day}`);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    
    // Handle ISO format
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getBillTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    food: 'bg-blue-100 text-blue-800 border-blue-200',
    flight: 'bg-purple-100 text-purple-800 border-purple-200',
    cab: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
};





