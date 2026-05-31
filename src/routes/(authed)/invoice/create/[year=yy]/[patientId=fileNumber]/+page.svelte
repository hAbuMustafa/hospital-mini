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

  import { invoiceData } from "./state.svelte";
  import PatientData from "./PatientData.svelte";
  import PricingRange from "./PricingRange.svelte";
  import InvoiceSignatures from "./InvoiceSignatures.svelte";
  import InvoiceTable from "./InvoiceTable.svelte";
  import DrugLookupItem from "./DrugLookupItem.svelte";

  let { data } = $props();

  const today = getToday();
  setToEndOfDay(today);

  // svelte-ignore state_referenced_locally
  invoiceData.patient = data.patient;
  // svelte-ignore state_referenced_locally
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
    <DrugLookupItem {drug} />
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
</style>
