<script lang="ts">
  import { formatDate, getDuration, getTermed, getToday } from "$lib/date/utils";

  const today = getToday();

  let { data } = $props();

  const { patient } = $derived(data);
  const stringifiedAdmissionDate = $derived(formatDate(patient.admission_date));
  const stringifiedDischargeDate = $derived(
    patient.discharge_date ? formatDate(patient.discharge_date) : "",
  );

  let fromDateString = $derived(stringifiedAdmissionDate);
  let toDateString = $derived(stringifiedDischargeDate);

  let periodSameAsStay = $derived(
    fromDateString === stringifiedAdmissionDate &&
      toDateString === stringifiedDischargeDate,
  );

  const pricingDuration = $derived(
    getTermed(
      getDuration(new Date(fromDateString), new Date(toDateString) || today) || 1,
      "يوم",
      "أيام",
    ),
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
        <!-- todo: should be tied to pricing period-->
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
  <div class="pricing-range" class:show-in-print={!periodSameAsStay}>
    <table>
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
              bind:value={fromDateString}
              min={stringifiedAdmissionDate}
              max={stringifiedDischargeDate}
            />
            <span class="selected-date">{fromDateString.replaceAll("-", "/")}</span>
          </td>
          <th>إلى:</th>
          <td>
            <input
              type="date"
              bind:value={toDateString}
              min={fromDateString}
              max={stringifiedDischargeDate}
            />
            <span class="selected-date">{toDateString.replaceAll("-", "/")}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
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
    &:not(.show-in-print) {
      @media print {
        display: none;
      }
    }

    table {
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
  }
</style>
