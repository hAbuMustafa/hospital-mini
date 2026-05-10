<script lang="ts">
  import { formatDate } from '$lib/utils.js';

  let { data } = $props();

  let dateFrom = $derived(data.dateFrom);
  let dateTo = $derived(data.dateTo);

  let isSameDay = $derived(data.dateFrom === data.dateTo)
</script>

<h1>نظام إصدار الفواتير</h1>
<h2>
  مرضى الداخلي الخروج {isSameDay
    ? `يوم ${data.dateFrom}`
    : `في الفترة من ${data.dateFrom} إلى ${data.dateTo}`}
</h2>
<div class="date-controls">
  <form action="/" method="GET">
    <label>
      من:
      <input type="date" name="f" bind:value={dateFrom} max={dateTo} />
    </label>

    <label>
      إلى:
      <input type="date" name="t" bind:value={dateTo} min={dateFrom} />
    </label>
    <button type="submit">تأكيد</button>
  </form>
</div>

<table>
  <thead>
    <tr>
      <th>رقم القيد</th>
      <th>اسم المريض</th>
      <th>تاريخ الدخول</th>
      <th>تاريخ الخروج</th>
      <th>فاتورة</th>
    </tr>
  </thead>
  <tbody>
    {#each data.patients as patient, i (patient.id)}
      <tr class="patient-card">
        <td>
          <a href="/invoice/list/{patient.id}" class="btn">{patient.id}</a>
        </td>
        <td>{patient.name}</td>
        <td>{formatDate(patient.admission_date)}</td>
        <td>{formatDate(patient.discharge_date)}</td>
        <td>
          <a href="/invoice/create/{patient.id}" class="btn">فاتورة</a>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .date-controls {
    display: flex;
    gap: 1rem;
    justify-content: space-around;
  }

  form {
    display: contents;
  }

  table {
    border-collapse: collapse;
    margin-block-start: 1rem;
  }

  table,
  tr,
  th,
  td {
    border: var(--main-border);
  }

  th,
  td {
    padding: 0.5rem;
  }

</style>
