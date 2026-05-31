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
  import { scale } from "svelte/transition";
  import { invoiceData } from "./state.svelte";
  import PatientData from "./PatientData.svelte";
  import PricingRange from "./PricingRange.svelte";
  import InvoiceSignatures from "./InvoiceSignatures.svelte";

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

  let invoiceDrugs: (InvoiceNarcoticDrugT | InvoiceSelectedDrugT)[] = $derived([
    ...invoiceData.staleData.narcotics,
    ...invoiceData.selectedDrugs,
  ]);

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

<table class="invoice-items">
  <colgroup>
    <col />
    {#if !invoiceData.patient.insured}
      <col />
    {/if}
    <col />
    <col class="amount-column" />
    <col />
    <col />
  </colgroup>
  <thead>
    <tr>
      <th>م</th>
      {#if !invoiceData.patient.insured}
        <th>كود النفقة</th>
      {/if}
      <th>اسم الصنف</th>
      <th>الكمية</th>
      <th>سعر الوحدة</th>
      <th>الإجمالي</th>
    </tr>
  </thead>
  {#if invoiceDrugs.length}
    <tbody>
      {#each invoiceDrugs as drug, i (drug.id)}
        <tr
          class:hide-in-print={drug.amount === 0}
          class:amount-not-allowed={drug.amount %
            (drug.id === 166 ? 30 : drug.id === 198 ? 60 : 1) >
            0}
          transition:scale
        >
          <td>
            {#if !drug.editable}
              {i + 1}
            {:else}
              <button
                onclick={() => {
                  invoiceData.selectedDrugs = invoiceData.selectedDrugs.filter(
                    (d) => d.id !== drug.id
                  );
                }}
              >
                {i + 1}
              </button>
            {/if}
          </td>
          {#if !invoiceData.patient.insured}
            <td>{drug.smc_code}</td>
          {/if}
          <td>{drug.name_ar}</td>
          <td>
            {#if !drug.editable}
              {drug.amount}
            {:else}
              <input
                type="number"
                name="amount-{drug.id}"
                id="amount-{drug.id}"
                min="0"
                bind:value={drug.amount}
              />
            {/if}
          </td>
          <td>{drug.price_resale?.toFixed(2)}</td>
          <td>
            {#if typeof drug.total === "number"}
              {drug.total.toFixed(2)}
            {:else}
              {drug.total().toFixed(2)}
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <th colspan="3">إجمالي الأدوية المنصرفة:</th>
        <td colspan="3">
          {invoiceDrugs
            .reduce((acc, curr) => {
              if (typeof curr.total === "number") {
                return acc + curr.total;
              } else {
                return acc + curr.total();
              }
            }, 0)
            .toFixed(2)}
        </td>
      </tr>
    </tfoot>
  {:else}
    <tbody>
      <tr>
        <td colspan="7">لم يتم إدخال أدوية</td>
      </tr>
    </tbody>
  {/if}
</table>

<InvoiceSignatures />

<PageBorder />

<style>
  table {
    td {
      text-align: center;
    }

    thead {
      background-color: var(--main-table-header-bg-color);
      th {
        padding: 0.25rem 0.75rem;
      }
    }
  }

  table.invoice-items {
    border-collapse: collapse;
    max-width: 80vw;

    th,
    td {
      border: var(--main-border);
      padding-inline: 0.75rem;
    }

    .amount-column {
      width: 8vw;
    }

    thead {
      @media print {
        display: table-header-group;
      }
    }

    tbody {
      @media print {
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

        td {
          page-break-inside: avoid;
        }
      }

      tr {
        td {
          &:has(input[type="number"]) {
            padding: 0;

            & > input[type="number"] {
              box-sizing: border-box;
              width: 100%;
              text-align: center;

              @media print {
                appearance: textfield;
                border: none;
                font-size: 1rem;
                &::-webkit-outer-spin-button,
                &::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
              }
            }
          }

          &:has(> button) {
            padding: 0;

            & > button {
              all: unset;
              cursor: pointer;
              position: relative;
              width: 100%;

              &:is(:hover, :focus-within)::after {
                content: "❌";
                position: absolute;
                inset: 0;
                padding: 0;
                pointer-events: none;
              }

              &:focus-within {
                outline: 2px double var(--main-accent-color);
              }
            }
          }
        }

        &.amount-not-allowed {
          background-color: salmon;
          text-decoration: line-through;

          @media print {
            background-color: unset;
            text-decoration: unset;
          }
        }
      }
    }

    tfoot {
      th {
        background-color: var(--main-table-header-bg-color);
        text-align: end;
      }

      td {
        font-size: 1.5rem;
        font-weight: bold;
      }

      @media print {
        display: table-row-group; /* to prevent tfoot from repeating at the end of every table on a page */
      }
    }
  }

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
