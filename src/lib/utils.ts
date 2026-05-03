export function formatDate(date: Date | null, format = 'yyyy/MM/dd') {
  if (!date) return '';
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const yearLen = /y+/.exec(format)?.[0].length ?? 0;
  const monthLen = /M+/.exec(format)?.[0].length ?? 0;
  const dayLen = /d+/.exec(format)?.[0].length ?? 0;

  return format
    .replace(/y+/, `${year}`.padStart(yearLen, '0'))
    .replace(/M+/, `${month}`.padStart(monthLen, '0'))
    .replace(/d+/, `${day}`.padStart(dayLen, '0'));
}
