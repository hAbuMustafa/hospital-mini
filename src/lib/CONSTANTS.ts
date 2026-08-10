export const nonDivisibleBoxes = [
  { id: 166, min: 30 },
  { id: 198, min: 60 },
];

export function isNarcotic(drug: { category: string }) {
  return drug.category === "مخدرات";
}

export function unacceptedAmount(drugId: number, amount: number) {
  return nonDivisibleBoxes.some((b) => b.id === drugId && amount % b.min !== 0);
}
