<script lang="ts">
  import { page } from "$app/state";
  import Combobox from "$lib/components/Combobox.svelte";
  import DateControls from "$lib/components/DateControls.svelte";
  import SelectItemPatient from "$lib/components/SelectItem_Patient.svelte";
  import { formatDate, setToEndOfDay, setToStartOfDay } from "$lib/date/utils";
  import { queryPatient } from "../../query.remote.js";
  import { getDischargesByPeriod } from "../invoice.remote.js";

  const urlFrom = $derived(page.url.searchParams.get("f"));
  const urlTo = $derived(page.url.searchParams.get("t"));

  const today = new Date();
  const theOtherDay = new Date(today);
  theOtherDay.setDate(today.getDate() - 2);

  const dischargesFrom = $derived.by(() => {
    const newFrom = urlFrom ? new Date(urlFrom) : theOtherDay;
    setToStartOfDay(newFrom);

    return newFrom;
  });
  const dischargesTo = $derived.by(() => {
    const newTo = urlTo ? new Date(urlTo) : theOtherDay;
    setToEndOfDay(newTo);

    return newTo;
  });

  const stringFrom = $derived(formatDate(dischargesFrom));
  const stringTo = $derived(formatDate(dischargesTo));

  let isSameDay = $derived(urlFrom === urlTo);

  let patientQuery = $state("");

  const discharges = $derived(
    await getDischargesByPeriod({
      from: dischargesFrom,
      to: dischargesTo,
    })
  );
</script>

<h1>إصدار فاتورة</h1>
<h2>
  مرضى الداخلي الخروج {isSameDay
    ? `يوم ${stringFrom.split("-").reverse().join("-")}`
    : `في الفترة من ${stringFrom.split("-").reverse().join("-")} إلى ${stringTo.split("-").reverse().join("-")}`}
</h2>

<DateControls from={stringFrom} to={stringTo} />

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
    {#each discharges as patient, i (patient.id)}
      <tr
        class="patient-card"
        class:is-economic={patient.insured ||
          ["رعاية أ", "رعاية ب", "ثاني ج", "ثاني د"].some((w) =>
            patient.wards.includes(w)
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
        <td>{patient.wards}</td>
        <td>{patient.narcotic_tickets > 0 ? "✔️" : "➖"}</td>
        <td>
          <a href="/invoice/create/{patient.id}" class="btn">فاتورة</a>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<br style="margin-block-start: 1rem;" />

<Combobox bind:query={patientQuery} endpoint={queryPatient} placeholder="بحث عن مريض">
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
