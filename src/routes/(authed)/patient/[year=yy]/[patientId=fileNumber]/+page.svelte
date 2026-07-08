<script lang="ts">
  import { page } from "$app/state";
  import { formatDate, getDuration, getTermed } from "$lib/date/utils";
  import { getOtherAdmissions, getPatientData } from "./getPatientHistory.remote";

  const patientId = [page.params.year, page.params.patientId].join("/");

  const patient = await getPatientData(patientId);
  const otherAdmissions = patient.id_number
    ? await getOtherAdmissions({ patientId, patientIdDocNumber: patient.id_number })
    : [];
</script>

<h1>{patient.name}</h1>
<table class="patient-data">
  <tbody>
    <tr>
      <th>رقم القيد:</th>
      <td>{patient.id}</td>

      <th>{patient.id_type}:</th>
      <td>{patient.id_number}</td>
    </tr>
    <tr>
      <th>قسم الدخول:</th>
      <td>{patient.ward_on_admission}</td>

      <th>القسم الحالي:</th>
      <td>{patient.ward_recent ?? patient.ward_on_admission}</td>
    </tr>
    <tr>
      <th>تاريخ الدخول:</th>
      <td>{formatDate(patient.admission_date, "YYYY/MM/DD")}</td>

      <th>تاريخ الخروج:</th>
      <td>
        {#if patient.discharge_date}
          {formatDate(patient.discharge_date, "YYYY/MM/DD")}
        {/if}
      </td>
    </tr>
    <tr>
      <th>التشخيص:</th>
      <td>{patient.diagnosis}</td>

      <th>مدة الإقامة:</th>
      <td>
        {getTermed(
          getDuration(patient.admission_date, patient.discharge_date ?? new Date()) ?? 1,
          "يوم",
          "أيام"
        )}
        {#if !patient.discharge_date}
          حتى اليوم
        {/if}
      </td>
    </tr>
  </tbody>
</table>

{#if otherAdmissions.length}
  <h2>دخول سابق</h2>
  <table class="other-admissions">
    <thead>
      <tr>
        <th rowspan="2">رقم القيد</th>
        <th colspan="2">فترة الإقامة</th>
        <th rowspan="2">إصدار فاتورة</th>
      </tr>
      <tr>
        <th>من</th>
        <th>إلى</th>
      </tr>
    </thead>
    <tbody>
      {#each otherAdmissions as p (p.id)}
        <tr>
          <td>
            <a href="/patient/{p.id}" class="btn">{p.id}</a>
          </td>
          <td>{formatDate(p.admission_date, "YYYY/MM/DD")}</td>
          <td>
            {#if p.discharge_date}
              {formatDate(p.discharge_date, "YYYY/MM/DD")}
            {/if}
          </td>
          <td>
            <a href="/invoice/create/{p.id}" class="btn invoice">فاتورة</a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  table.patient-data {
    th {
      text-align: end;
    }

    td {
      padding-inline: 5vw;
    }
  }

  table.other-admissions {
    border-collapse: collapse;

    th,
    td {
      border: var(--main-border);
      padding: 0.25rem 0.5rem;
    }
  }

  a.btn {
    display: inline-block;
    width: 80%;
  }

  a.btn.invoice {
    background-color: gold;
    color: contrast-color(gold);
  }
</style>
