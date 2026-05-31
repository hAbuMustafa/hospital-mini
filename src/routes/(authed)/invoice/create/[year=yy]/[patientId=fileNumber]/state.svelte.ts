type Invoice = {
  patient: PatientT;
  staleData: StaleData;
  selectedDrugs: InvoiceSelectedDrugT[];
};

const initialData = {
  patient: {
    id: "",
    name: "",
    id_type: "",
    id_number: "",
    diagnosis: "",
    admission_date: new Date("1970-01-01"),
    discharge_date: new Date("1970-01-01"),
    discharge_reason: "",
    ward_on_admission: "",
    ward_recent: "",
    admission_notes: "",
    gender: false,
    birthdate: new Date("1970-01-01"),
    insured: false,
  },
  staleData: { ward: "", narcotics: [] },
  selectedDrugs: [],
};

export const invoiceData = $state<Invoice>(initialData);
