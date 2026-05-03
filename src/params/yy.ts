export function match(value) {
  const thisYear = new Date().getFullYear() - 2000;
  return (
    /^\d{2}$/.test(value) && Number(value) >= 24 && Number(value) <= thisYear
  );
}
