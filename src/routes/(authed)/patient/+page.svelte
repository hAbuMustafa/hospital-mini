<script lang="ts">
  import { formatDate, getTermed } from "$lib/date/utils";

  let { data } = $props();

  const patientsByWard = Object.groupBy(
    data.patients,
    (p) => (p.ward_recent || p.ward_on_admission)!,
  );

  const wards = [
    "رعاية أ",
    "رعاية ب",
    "ثاني أ",
    "ثاني ب",
    "ثاني ج",
    "ثاني د",
    "ثالث أ",
    "ثالث ب",
    "ثالث ج",
    "ثالث د",
    "رابع أ",
    "رابع ب",
    "رابع ج",
    "رابع د",
  ];
</script>

<h1>بيان بالمرضى بالأقسام</h1>

{#each wards as ward (ward)}
  {#if patientsByWard[ward]}
    {@render Ward(ward, patientsByWard[ward])}
  {/if}
{/each}

{#snippet Ward(wardName: string, patientsList: PatientT[])}
  <h2>
    <span>{wardName}</span>
    <small>{getTermed(patientsList?.length, "مريض", "مرضى")}</small>
  </h2>

  <table>
    <thead>
      <tr>
        <th>رقم الملف</th>
        <th>اسم المريض</th>
        <th>التشخيص</th>
        <th>تاريخ الدخول</th>

        <th>فاتورة</th>
        <th>صرف</th>
      </tr>
    </thead>
    <tbody>
      {#each patientsList as patient (patient.id)}
        <tr>
          <td>
            <a href="/patient/{patient.id}" class="btn">{patient.id}</a>
          </td>
          <td>{patient.name}</td>
          <td>{patient.diagnosis}</td>
          <td>{formatDate(patient.admission_date, "YYYY/MM/DD")}</td>

          <td>
            <a href="/invoice/create/{patient.id}" class="btn invoice">فاتورة</a>
          </td>
          <td>
            <a href="/dispense/{patient.id}" class="btn dispense">صرف</a>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/snippet}

<style>
  h2 {
    width: 100%;
    display: flex;
    justify-content: space-around;

    &:not(:first-of-type) {
      border-block-start: var(--main-border);
      padding-block-start: 1rem;
    }

    small {
      color: gray;
    }
  }

  table {
    max-width: 80vw;

    th,
    td {
      border: var(--main-border);
    }

    tbody {
      tr {
        td {
          padding: 0.5rem 0.25rem;
        }
      }
    }
  }

  .btn.invoice {
    background-color: gold;
    color: contrast-color(gold);
  }

  .btn.dispense {
    background-color: green;
    color: contrast-color(green);
  }
</style>
