<script lang="ts">
  import { formatDate, getDuration, getTermed, getToday } from "$lib/date/utils";

  const today = getToday();

  let { data } = $props();

  const { patient } = $derived(data);
  const stringifiedAdmissionDate = $derived(formatDate(patient.admission_date));
  const stringifiedDischargeDate = $derived(
    patient.discharge_date ? formatDate(patient.discharge_date) : "",
  );

  let fromDate = $derived(stringifiedAdmissionDate);
  let toDate = $derived(stringifiedDischargeDate);

  let periodSameAsStay = $derived(
    fromDate === stringifiedAdmissionDate && toDate === stringifiedDischargeDate,
  );

  const pricingDuration = $derived(
    getTermed(getDuration(fromDate, toDate || today), "يوم", "أيام"),
  );
</script>

<header>
  <h1>فاتورة أدوية</h1>
  <table class="patient-data">
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
        <td>{patient.ward_recent ?? patient.ward_on_admission}</td>

        <th>تاريخ الدخول:</th>
        <td>{formatDate(patient.admission_date, "YYYY/MM/DD")}</td>
      </tr>
      <tr>
        <th>التشخيص:</th>
        <td>{patient.diagnosis}</td>

        <th>تاريخ الخروج:</th>
        <td>
          {#if patient.discharge_date}
            {formatDate(patient.discharge_date, "YYYY/MM/DD")}
          {/if}
        </td>
      </tr>
    </tbody>
  </table>
  <details open={true}>
    <summary>فترة تسعير</summary>
    <table class="pricing-range">
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
              bind:value={fromDate}
              min={stringifiedAdmissionDate}
              max={stringifiedDischargeDate}
            />
            <span class="selected-date">{fromDate.replaceAll("-", "/")}</span>
          </td>
          <th>إلى:</th>
          <td>
            <input
              type="date"
              bind:value={toDate}
              min={stringifiedAdmissionDate}
              max={stringifiedDischargeDate}
            />
            <span class="selected-date">{toDate.replaceAll("-", "/")}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </details>
  <h2>سداد فاتورة</h2>
</header>

<style>
  table {
    td {
      text-align: center;
    }
  }

  .patient-data {
    th {
      text-align: end;
    }

    td {
      padding-inline: 3vw;
    }
  }

  .pricing-range {
    width: 100%;
    border-collapse: collapse;

    &,
    th,
    td {
      border: var(--main-border);
    }

    thead {
      background-color: var(--main-table-header-bg-color);
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
</style>
