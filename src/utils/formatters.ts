import { format } from 'date-fns';

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy');
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  } catch {
    return dateString;
  }
};

export const getStatusColor = (status: string): string => {
  const colors = {
    planning: 'bg-gray-100 text-gray-800',
    tender: 'bg-blue-100 text-blue-800',
    award: 'bg-yellow-100 text-yellow-800',
    contract: 'bg-green-100 text-green-800',
    implementation: 'bg-purple-100 text-purple-800',
    complete: 'bg-green-100 text-green-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status: string): string => {
  const labels = {
    planning: 'Pianificazione',
    tender: 'In Gara',
    award: 'Aggiudicato',
    contract: 'Contratto',
    implementation: 'In Esecuzione',
    complete: 'Completato',
  };
  return labels[status as keyof typeof labels] || status;
};

export const getProcurementMethodLabel = (method: string): string => {
  const labels = {
    open: 'Procedura Aperta',
    selective: 'Procedura Selettiva',
    limited: 'Procedura Limitata',
    direct: 'Affidamento Diretto',
  };
  return labels[method as keyof typeof labels] || method;
};

export const getCategoryLabel = (category: string): string => {
  const labels = {
    goods: 'Beni',
    services: 'Servizi',
    works: 'Lavori',
  };
  return labels[category as keyof typeof labels] || category;
};