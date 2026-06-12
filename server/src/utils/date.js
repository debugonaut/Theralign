/**
 * Formats a Date object (or date input) into YYYY-MM-DD format in Asia/Kolkata timezone.
 * This is safe to run in any Node/serverless environment (including Vercel) that has limited
 * locales, as it uses the standard 'en-US' locale format to extract date parts.
 * 
 * @param {Date|string|number} date 
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatDateKolkata = (date) => {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  const parts = formatter.formatToParts(d);
  const year = parts.find((p) => p.type === 'year').value;
  const month = parts.find((p) => p.type === 'month').value;
  const day = parts.find((p) => p.type === 'day').value;
  
  return `${year}-${month}-${day}`;
};

/**
 * Converts a YYYY-MM-DD date string to DD/MM/YYYY display format.
 * Used for all user-facing date strings — ADR-005.
 *
 * @param {string} dateStr — YYYY-MM-DD
 * @returns {string} DD/MM/YYYY
 */
export const formatDisplayDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
};
