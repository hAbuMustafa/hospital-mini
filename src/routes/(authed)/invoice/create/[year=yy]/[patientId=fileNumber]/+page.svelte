<script lang="ts">
  import { formatDate, getDuration, getTermed, getToday } from "$lib/date/utils";

  let { data } = $props();
  const { patient } = $derived(data);

  const today = getToday();

  const fromDate = $derived(patient.admission_date);
  const toDate = $derived(patient.discharge_date);

  const pricingDuration = $derived(
    getTermed(getDuration(fromDate, toDate || today), "يوم", "أيام"),
  );
</script>

<header>
  <h1>فاتورة أدوية</h1>
  <table>
    <tbody>
      <tr>
        <th>رقم القيد:</th>
        <td>{patient.id}</td>

        <th>مدة الإقامة:</th>
        <td>
          {pricingDuration}
        </td>
      </tr>
      <tr>
        <th>اسم المريض:</th>
        <td>{patient.name}</td>

        <th>{patient.id_type}:</th>
        <td>{patient.id_number}</td>
      </tr>
      <tr>
        <th>القسم:</th>
        <td>{patient.ward_recent}</td>

        <th>تاريخ الدخول:</th>
        <td>{formatDate(patient.admission_date)}</td>
      </tr>
      <tr>
        <th>التشخيص:</th>
        <td>{patient.diagnosis}</td>

        <th>تاريخ الخروج:</th>
        <td>
          {#if patient.discharge_date}
            {formatDate(patient.discharge_date)}
          {/if}
        </td>
      </tr>
    </tbody>
  </table>

  <h2>سداد فاتورة</h2>
</header>

<style>
  table {
    th {
      text-align: end;
    }

    td {
      text-align: center;
      padding-inline: 3vw;
    }
  }
</style>
