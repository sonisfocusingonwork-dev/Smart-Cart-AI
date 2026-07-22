export const normalizePhoneNumber = (value: string): string => {
  const cleaned = value.trim().replace(/\s+/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+84')) {
    return '0' + cleaned.slice(3);
  }
  return cleaned;
};

export const normalizeAdminRole = (role?: string): string => {
  const normalized = (role || '').trim().toLowerCase();
  if (['rootadmin', 'storemanager', 'tech', 'security', 'admin'].includes(normalized)) {
    return 'admin';
  }
  return normalized;
};
