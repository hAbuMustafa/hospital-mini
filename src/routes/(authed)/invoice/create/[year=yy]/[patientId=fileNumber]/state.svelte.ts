export const invoiceData = $state<{
  patient: PatientT;
  staleData: StaleData;
  fromDateString: string;
  toDateString: string;
}>({
  patient: null,
  staleData: null,
  fromDateString: "",
  toDateString: "",
});
