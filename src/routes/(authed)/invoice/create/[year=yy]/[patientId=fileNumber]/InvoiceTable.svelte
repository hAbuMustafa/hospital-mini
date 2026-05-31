<script lang="ts">
  import { scale } from "svelte/transition";
  import { invoiceData } from "./state.svelte";
  import InvoiceItem from "./InvoiceItem.svelte";
  import InvoiceFooter from "./InvoiceFooter.svelte";

  let invoiceDrugs: (InvoiceNarcoticDrugT | InvoiceSelectedDrugT)[] = $derived([
    ...invoiceData.staleData.narcotics,
    ...invoiceData.selectedDrugs,
  ]);
</script>

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
        <InvoiceItem {drug} {i} />
      {/each}
    </tbody>
    <InvoiceFooter {invoiceDrugs} />
  {:else}
    <tbody>
      <tr>
        <td colspan="7">لم يتم إدخال أدوية</td>
      </tr>
    </tbody>
  {/if}
</table>

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
    }
  }
</style>
