<script lang="ts">
  import { formatDate } from "$lib/date/utils";
  import { debounce } from "lodash-es";
  import { invoiceData } from "./state.svelte";

  let { fromDateString = $bindable(), toDateString = $bindable() } = $props();

  let fromInput: HTMLInputElement;
  let toInput: HTMLInputElement;

  let periodSameAsStay = $derived(
    fromDateString === formatDate(invoiceData.patient.admission_date) &&
      toDateString === formatDate(invoiceData.patient.discharge_date ?? new Date())
  );

  function updateStaleDataOnInput(node: HTMLInputElement) {
    node.addEventListener(
      "change",
      debounce(async () => {
        if (!fromInput.reportValidity() || !toInput.reportValidity()) return;

        invoiceData.staleData = (await fetch(
          `/api/v1/patient/getStaleData?patient_id=${invoiceData.patient.id}&f=${formatDate(fromDateString)}&t=${formatDate(toDateString)}`
        ).then((d) => d.json())) as StaleData;

        // if (invoiceData.staleData.narcotics.length) {
        //   invoiceDrugs
        //     .filter((n) => typeof n.total === "function")
        //     .unshift(...invoiceData.staleData.narcotics);
        // }
      }, 1000)
    );
  }
</script>

<div class="pricing-range" class:hide-in-print={periodSameAsStay}>
  <table>
    <thead>
      <tr>
        <th colspan="4">فترة التسعير</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>من:</th>
        <td>
          <input
            type="date"
            bind:value={fromDateString}
            min={formatDate(invoiceData.patient.admission_date)}
            max={formatDate(invoiceData.patient.discharge_date ?? new Date())}
            bind:this={fromInput}
            use:updateStaleDataOnInput
          />
          <span class="selected-date">{fromDateString.replaceAll("-", "/")}</span>
        </td>
        <th>إلى:</th>
        <td>
          <input
            type="date"
            bind:value={toDateString}
            min={fromDateString}
            max={formatDate(invoiceData.patient.discharge_date ?? new Date())}
            bind:this={toInput}
            use:updateStaleDataOnInput
          />
          <span class="selected-date">{toDateString.replaceAll("-", "/")}</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<style>
  .pricing-range {
    margin-block-start: 1rem;

    table {
      width: 100%;
      border-collapse: collapse;

      &,
      th,
      td {
        border: var(--main-border);
      }

      input[type="date"] {
        width: 80%;
        text-align: center;
        font-size: inherit;
      }

      span.selected-date {
        display: none;
      }

      @media print {
        input[type="date"] {
          display: none;
        }

        span.selected-date {
          display: inline-block;
        }
      }
    }
  }
</style>
