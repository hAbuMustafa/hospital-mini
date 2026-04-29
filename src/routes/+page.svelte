<script lang="ts">
  let { data } = $props();

  let dateFrom = $derived(data.dateFrom);
  let dateTo = $derived(data.dateTo);

  function formatDate(date: Date | null) {
    if (!date) return "";
    return `${date.getFullYear()}/${`${date.getMonth() + 1}`.padStart(2, "0")}/${`${date.getDate()}`.padStart(2, "0")}`;
  }
</script>

<h1>نظام إصدار الفواتير</h1>
<h2>
  مرضى الداخلي الخروج {data.dateFrom === data.dateTo
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
          <a href="/invoice/list/{patient.id}">{patient.id}</a>
        </td>
        <td>{patient.name}</td>
        <td>{formatDate(patient.admission_date)}</td>
        <td>{formatDate(patient.discharge_date)}</td>
        <td>
          <a href="/invoice/create/{patient.id}">فاتورة</a>
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

  a {
    color: unset;
    text-decoration: unset;
    padding: 0.25rem;
    border: var(--main-border);
    border-radius: 4px;

    font-weight: bolder;
    background-color: var(--main-accent-color);
  }
</style>
