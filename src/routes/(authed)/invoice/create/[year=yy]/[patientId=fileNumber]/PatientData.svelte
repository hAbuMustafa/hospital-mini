<script lang="ts">
  import { formatDate } from "$lib/date/utils";
  import { invoiceData } from "./state.svelte";

  let { pricingDuration } = $props();
</script>

<table class="patient-data">
  <tbody>
    <tr>
      <th>رقم القيد:</th>
      <td>{invoiceData.patient?.id}</td>

      <th>مدة الإقامة:</th>
      <td>
        {pricingDuration}
      </td>
    </tr>
    <tr>
      <th>اسم المريض:</th>
      <td>{invoiceData.patient?.name}</td>

      <th>{invoiceData.patient?.id_type}:</th>
      <td>{invoiceData.patient?.id_number}</td>
    </tr>
    <tr>
      <th>القسم:</th>
      <td>{invoiceData.staleData?.ward}</td>

      <th>تاريخ الدخول:</th>
      <td>{formatDate(invoiceData.patient?.admission_date!, "YYYY/MM/DD")}</td>
    </tr>
    <tr>
      <th>التشخيص:</th>
      <td>{invoiceData.patient?.diagnosis}</td>

      <th>تاريخ الخروج:</th>
      <td>
        {#if invoiceData.patient?.discharge_date}
          {formatDate(invoiceData.patient?.discharge_date, "YYYY/MM/DD")}
        {/if}
      </td>
    </tr>
  </tbody>
</table>

<style>
  table.patient-data {
    th {
      text-align: end;
    }

    td {
      padding-inline: 3vw;
    }
  }
</style>
