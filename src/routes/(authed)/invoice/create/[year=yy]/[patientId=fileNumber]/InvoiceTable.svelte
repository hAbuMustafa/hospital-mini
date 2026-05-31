<script lang="ts">
  import { scale } from "svelte/transition";
  import { invoiceData } from "./state.svelte";

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
</style>
