const formatDateKolkata = (date) => {
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

console.log("Current time in IST YYYY-MM-DD:", formatDateKolkata(new Date()));
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
console.log("Tomorrow in IST YYYY-MM-DD:", formatDateKolkata(tomorrow));
