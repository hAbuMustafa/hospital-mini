export const nonDivisibleBoxes = new Map([
  [166, 30],
  [198, 60],
]);

export function isNarcotic(drug: { category: string }) {
  return drug.category === "مخدرات";
}

export function getMinAmount(drugId: number) {
  return nonDivisibleBoxes.get(drugId) ?? 1;
}

export function unacceptedAmount(drugId: number, amount: number) {
  return amount % getMinAmount(drugId) !== 0;
}
