<script lang="ts">
  import { formatDate } from "$lib/utils";

  let { data } = $props();

  let dateFrom = $derived(data.dateFrom);
  let dateTo = $derived(data.dateTo);

  let [yesterday, tomorrow] = $derived.by(() => {
    const fDate = new Date(data.dateFrom);
    fDate.setDate(fDate.getDate() - 1);
    const yDay = formatDate(fDate, "yyyy-MM-dd");

    fDate.setDate(fDate.getDate() + 2);
    const nxDay = formatDate(fDate, "yyyy-MM-dd");

    return [yDay, nxDay];
  });

  let isSameDay = $derived(data.dateFrom === data.dateTo);
</script>

<h1>إصدار فاتورة</h1>
<h2>
  مرضى الداخلي الخروج {isSameDay
    ? `يوم ${data.dateFrom.split("-").reverse().join("-")}`
    : `في الفترة من ${data.dateFrom.split("-").reverse().join("-")} إلى ${data.dateTo.split("-").reverse().join("-")}`}
</h2>
<div class="date-controls">
  <a href="?f={yesterday}&t={yesterday}" class="btn">&Lt;</a>
  <form method="GET">
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
  <a href="?f={tomorrow}&t={tomorrow}" class="btn">&Gt;</a>
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
    align-items: center;
  }

  form {
    display: contents;
  }

  table {
    border-collapse: collapse;
    margin-block-start: 1rem;
  }

  thead {
    background-color: hsl(from var(--main-bg-color) h s 30%);
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
