<script lang="ts">
  import {
    formatDate,
    getDuration,
    getTermed,
    getToday,
    setToEndOfDay,
  } from "$lib/date/utils";

  import { debounce } from "lodash-es";

  const today = getToday();
  setToEndOfDay(today);

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

  let staleData = $derived(data.staleData);

  let fromInput: HTMLInputElement;
  let toInput: HTMLInputElement;

  function updateStaleDataOnInput(node: HTMLInputElement) {
    node.addEventListener(
      "change",
      debounce(async () => {
        if (!fromInput.reportValidity() || !toInput.reportValidity()) return;

        staleData = (await fetch(
          `/api/v1/patient/getStaleData?patient_id=${patient.id}&f=${formatDate(fromDateString)}&t=${formatDate(toDateString)}`,
        ).then((d) => d.json())) as StaleData;

        console.log(staleData);
      }, 1000),
    );
  }
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
        <td>{staleData.ward}</td>

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
  <div class="pricing-range" class:hide-in-print={periodSameAsStay}>
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
              bind:this={fromInput}
              use:updateStaleDataOnInput
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
              bind:this={toInput}
              use:updateStaleDataOnInput
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
    margin-block-start: 1rem;

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
