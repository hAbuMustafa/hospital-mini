export const invoiceData = $state<{
  patient: PatientT | null;
  staleData: StaleData | null;
}>({
  patient: null,
  staleData: null,
});
