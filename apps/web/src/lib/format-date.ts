export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}
