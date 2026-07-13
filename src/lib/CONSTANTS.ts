export const narcoticsIds = [116, 117, 119, 229];
export const nonDivisibleBoxes = [
  { id: 166, min: 30 },
  { id: 198, min: 60 },
];

export function isNarcotic(drugId: number) {
  return narcoticsIds.includes(drugId);
}

export function unacceptedAmount(drugId: number, amount: number) {
  return nonDivisibleBoxes.some((b) => b.id === drugId && amount % b.min !== 0);
}
