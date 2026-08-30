<script lang="ts">
  import Combobox from "$lib/components/Combobox.svelte";
  import DateControls from "$lib/components/DateControls.svelte";
  import SelectItemPatient from "$lib/components/SelectItem_Patient.svelte";
  import { formatDate } from "$lib/date/utils";

  let { data } = $props();

  let isSameDay = $derived(data.dateFrom === data.dateTo);

  let patientQuery = $state("");
</script>

<h1>إصدار فاتورة</h1>
<h2>
  مرضى الداخلي الخروج {isSameDay
    ? `يوم ${data.dateFrom.split("-").reverse().join("-")}`
    : `في الفترة من ${data.dateFrom.split("-").reverse().join("-")} إلى ${data.dateTo.split("-").reverse().join("-")}`}
</h2>

<DateControls from={data.dateFrom} to={data.dateTo} />

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
        (data.hasNarcotics.find((p) => p.patient_id === patient.id)?.amount ?? 0) > 0}
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
          <a href="/patient/{patient.id}" class="btn pii">{patient.id}</a>
        </td>
        <td class="pii">{patient.name}</td>
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

<br style="margin-block-start: 1rem;" />

<Combobox
  bind:query={patientQuery}
  endpoint={`/api/v1/patient?q=${patientQuery}`}
  placeholder="بحث عن مريض"
>
  {#snippet itemSnippet(patient: PatientT)}
    <SelectItemPatient {patient} query={patientQuery} href={`create/${patient.id}`} />
  {/snippet}
</Combobox>

<style>
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
</style>
