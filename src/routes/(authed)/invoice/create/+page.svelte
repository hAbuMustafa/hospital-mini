<script lang="ts">
  import { goto } from "$app/navigation";
  import Combobox from "$lib/components/Combobox.svelte";
  import { formatDate } from "$lib/date/utils";

  let { data } = $props();

  let dateFrom = $derived(data.dateFrom);
  let dateTo = $derived(data.dateTo);

  let [yesterday, tomorrow] = $derived.by(() => {
    const fDate = new Date(data.dateFrom);
    fDate.setDate(fDate.getDate() - 1);
    const yDay = formatDate(fDate);

    fDate.setDate(fDate.getDate() + 2);
    const nxDay = formatDate(fDate);

    return [yDay, nxDay];
  });

  let isSameDay = $derived(data.dateFrom === data.dateTo);

  let patientQuery = $state("");
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
      <th>مؤمن عليه؟</th>
      <th>الأقسام</th>
      <th>له منصرف مخدرات؟</th>
      <th>فاتورة</th>
    </tr>
  </thead>
  <tbody>
    {#each data.patients as patient, i (patient.id)}
      {@const hasNarcotics =
        (data.hasNarcotics.find((p) => p.patient_id === patient.id)?.amount_dispensed ??
          0) > 0}
      {@const patientWards = Array.from(
        new Set([
          patient.ward_on_admission,
          ...(data.wards?.find((p) => p.patient_id === patient.id)?.wards?.split(" - ") ||
            []),
        ])
      ).join(" - ")}
      <tr
        class="patient-card"
        class:is-economic={patient.insured ||
          ["رعاية أ", "رعاية ب", "ثاني ج", "ثاني د"].some((w) =>
            patientWards.includes(w)
          )}
      >
        <td>
          <a href="/invoice/list/{patient.id}" class="btn">{patient.id}</a>
        </td>
        <td>{patient.name}</td>
        <td>{formatDate(patient.admission_date, "YYYY/MM/DD")}</td>
        <td>
          {#if patient.discharge_date}
            {formatDate(patient.discharge_date, "YYYY/MM/DD")}
          {/if}
        </td>
        <td>{patient.insured ? "✔️" : "➖"}</td>
        <td>{patientWards}</td>
        <td>{hasNarcotics ? "✔️" : "➖"}</td>
        <td>
          <a href="/invoice/create/{patient.id}" class="btn">فاتورة</a>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<Combobox
  bind:query={patientQuery}
  endpoint={`/api/v1/patient?q=${patientQuery}`}
  placeholder="بحث عن مريض"
>
  {#snippet itemSnippet(patient: PatientT)}
    <button
      class="patient-select"
      onclick={() => {
        goto(`create/${patient.id}`);
      }}
    >
      <span>{@render markMatches(patient.id)}</span>
      <strong>{@render markMatches(patient.name!)}</strong>
      <span>
        من <span class="date">{formatDate(patient.admission_date, "YYYY/MM/DD")}</span>
        {#if patient.discharge_date}
          إلى <span class="date">{formatDate(patient.discharge_date, "YYYY/MM/DD")}</span>
        {/if}
      </span>
      {#if patient.id_number}
        <span>{patient.id_type}: {@render markMatches(patient.id_number)}</span>
      {/if}
    </button>
  {/snippet}
</Combobox>

{#snippet markMatches(text: string)}
  {@html text.replaceAll(
    new RegExp(patientQuery.replaceAll(" ", ".*"), "g"),
    (match) => `<mark>${match}</mark>`
  )}
{/snippet}

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
    background-color: var(--main-table-header-bg-color);
  }

  table,
  tr,
  th,
  td {
    border: var(--main-border);
  }

  tr.is-economic {
    background-color: hsla(219, 100%, 56%, 0.4);
  }

  th,
  td {
    padding: 0.5rem;
  }

  button.patient-select {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border: none;

    & > span > span.date {
      border: var(--main-border);
      padding-inline: 0.25rem;
      border-radius: 4px;
    }

    &:focus {
      border: 3px double var(--main-accent-color);
      outline: none;
    }
  }
</style>
