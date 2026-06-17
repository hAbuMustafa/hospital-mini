<script lang="ts">
  import { formatDate, getTermed } from "$lib/date/utils";
  import ClearFiltersIcon from "@lucide/svelte/icons/funnel-x";
  import { fly } from "svelte/transition";

  let { data } = $props();

  const patientsByWard = Object.groupBy(
    // svelte-ignore state_referenced_locally
    data.patients,
    (p) => (p.ward_recent || p.ward_on_admission)!
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

  let query = $state("");

  let qRegex = $derived(
    new RegExp(
      query
        .replaceAll(/اأإآ/g, "[اأإآ]")
        .replaceAll(/ةه/g, "[ةه]")
        .replaceAll(/يى/g, "[يى]")
        .replaceAll(/\s+/g, ".*"),
      "g"
    )
  );
</script>

<h1>بيان بالمرضى بالأقسام</h1>

<input type="search" bind:value={query} placeholder="بحث عن مريض محجوز 🔍" />

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
        <tr class:filtered-out={!qRegex.test(patient.name!)}>
          <td>
            <a href="/patient/{patient.id}" class="btn">{patient.id}</a>
          </td>
          <td>
            {#if query}
              {@html patient.name?.replaceAll(qRegex, (match) => `<mark>${match}</mark>`)}
            {:else}
              {patient.name}
            {/if}
          </td>
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

{#if query}
  <button
    class="clear-filter"
    in:fly={{ y: -1000 }}
    title="إلغاء البحث"
    onclick={() => {
      query = "";
    }}
  >
    <ClearFiltersIcon />
  </button>
{/if}

<style>
  input[type="search"] {
    text-align: center;
    font-size: 1.5rem;
  }

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

        &.filtered-out {
          display: none;
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

  button.clear-filter {
    position: fixed;
    inset-block-end: 1rem;
    inset-inline-end: 1rem;

    padding: 0.35rem 0.5rem;

    border-radius: 50%;
    background-color: var(--main-accent-color);
    color: var(--main-bg-color);
  }
</style>
