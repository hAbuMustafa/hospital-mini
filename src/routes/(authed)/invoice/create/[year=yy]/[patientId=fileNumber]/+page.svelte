<script lang="ts">
  import DrugLookup from "$lib/components/invoice/DrugLookup.svelte";
  import PageBorder from "$lib/components/PageBorder.svelte";
  import {
    formatDate,
    getDuration,
    getTermed,
    getToday,
    setToEndOfDay,
  } from "$lib/date/utils";

  import { toast } from "svelte-sonner";
  import { invoiceData } from "./state.svelte";
  import PatientData from "./PatientData.svelte";
  import PricingRange from "./PricingRange.svelte";
  import InvoiceSignatures from "./InvoiceSignatures.svelte";
  import InvoiceTable from "./InvoiceTable.svelte";

  let { data } = $props();

  const today = getToday();
  setToEndOfDay(today);

  invoiceData.patient = data.patient;
  invoiceData.staleData = data.staleData;

  const stringifiedAdmissionDate = $derived(
    formatDate(invoiceData.patient.admission_date)
  );
  const stringifiedDischargeDate = $derived(
    invoiceData.patient.discharge_date
      ? formatDate(invoiceData.patient.discharge_date)
      : ""
  );

  let fromDateString = $derived(stringifiedAdmissionDate);
  let toDateString = $derived(stringifiedDischargeDate);

  let periodSameAsStay = $derived(
    fromDateString === formatDate(invoiceData.patient.admission_date) &&
      toDateString === formatDate(invoiceData.patient.discharge_date ?? new Date())
  );

  const pricingDuration = $derived(
    getTermed(
      getDuration(new Date(fromDateString), new Date(toDateString) || today) || 1,
      "يوم",
      "أيام"
    )
  );

  let pageTitle = $derived.by(() => {
    if (periodSameAsStay) return invoiceData.patient.name;

    return `${invoiceData.patient.name} (من ${fromDateString.split("-").reverse().join("-")} إلى ${toDateString.split("-").reverse().join("-")})`;
  });

  function selectDrug(item: InvoiceSelectedDrugT) {
    const foundItemIndexInList = invoiceData.selectedDrugs.findIndex(
      (d) => d.id === item.id
    );
    if (foundItemIndexInList > -1) {
      invoiceData.selectedDrugs[foundItemIndexInList].amount++;
      toast.info(
        `الصنف مضاف سابقا في السطر ${foundItemIndexInList + 1} تم زيادة الكمية لتصبح ${invoiceData.selectedDrugs[foundItemIndexInList].amount}`
      );
      return;
    }

    item.amount = 1;
    item.total = () => item.amount * (item.price_resale ?? 0);
    item.editable = true;
    invoiceData.selectedDrugs.push(item);
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<header>
  <h1>فاتورة أدوية</h1>
  <PatientData {pricingDuration} />
  <PricingRange bind:fromDateString bind:toDateString />
  <h2>سداد فاتورة</h2>
</header>

<DrugLookup filterIds={[116, 117, 119, 229]}>
  {#snippet drugSnippet(drug: DrugT)}
    <button
      type="button"
      class="drug-select"
      onclick={() => selectDrug(drug as InvoiceSelectedDrugT)}
    >
      <strong class="name-ar">{drug.name_ar}</strong>
      <span class="name">{drug.tradename_ar}</span>
      <span class="price">{drug.price_resale?.toFixed(3)} جنيه</span>
    </button>
  {/snippet}
</DrugLookup>

<InvoiceTable />

<InvoiceSignatures />

<PageBorder />

<style>
  @media print {
    @page {
      margin-bottom: 1.5cm;

      @bottom-left {
        content: "صفحة " counter(page) " من " counter(pages);
        vertical-align: top;
      }
    }
  }

  button.drug-select {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
