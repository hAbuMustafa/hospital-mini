<script lang="ts">
  import { formatDate, getTermed } from "$lib/date/utils";
  import { countryMap, getFlagEmoji } from "$lib/utils/countries";
  import Female from "@lucide/svelte/icons/venus";
  import Inmate from "@lucide/svelte/icons/tally-5";
  import Student from "@lucide/svelte/icons/graduation-cap";
  import ClearFiltersIcon from "@lucide/svelte/icons/funnel-x";
  import { fly } from "svelte/transition";
  import { getUnlinkedTickets } from "../pharmacy/ticket.remote.js";
  import DispenseToUnregisteredPatient from "../../DispenseToUnregisteredPatient.svelte";
  import { authState } from "$lib/auth-client/auth.svelte.js";

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

  let headerHight = $state(0);

  let unregisteredPatients = await getUnlinkedTickets();

  let isPharmacy = authState.user?.role?.includes("-ph-");
</script>

<header bind:clientHeight={headerHight}>
  <h1>بيان بالمرضى بالأقسام</h1>

  <input type="search" bind:value={query} placeholder="بحث عن مريض محجوز 🔍" />
</header>

<ul class="nav" role="navigation">
  {#each wards.filter((w) => Object.keys(patientsByWard).includes(w)) as ward (ward)}
    <li>
      <a href="#{ward}">{ward}</a>
    </li>
  {/each}
  {#if isPharmacy && unregisteredPatients.length}
    <hr />
    <li>
      <a href="#unregistered">غير مسجلين</a>
    </li>
  {/if}
</ul>

{#each wards as ward (ward)}
  {#if patientsByWard[ward] && (!query || (query && patientsByWard[ward].some( (p) => qRegex.test(p.name!) )))}
    <div class="ward-wrapper" style:--header-height={headerHight - 1 + "px"}>
      {@render Ward(ward, patientsByWard[ward])}
    </div>
  {/if}
{/each}

{#if isPharmacy && unregisteredPatients.length}
  <div class="ward-wrapper">
    <h2 id="unregistered">مرضى غير مسجلين</h2>
    <div class="unregistered-patients">
      {#each unregisteredPatients as p, i (i)}
        <a href="/dispense/25/0?patient_name={p.name}" class="btn" style:--bg="green">
          {p.name}
        </a>
      {/each}
    </div>
    <DispenseToUnregisteredPatient />
  </div>
{/if}

{#snippet Ward(wardName: string, patientsList: PatientT[])}
  <h2>
    <span>{wardName}</span>
    <small>{getTermed(patientsList?.length, "مريض", "مرضى")}</small>
  </h2>

  <table id={wardName}>
    <thead>
      <tr>
        <th>رقم القيد</th>
        <th>اسم المريض</th>
        <th>التشخيص</th>
        <th>تاريخ الدخول</th>

        {#if isPharmacy}
          <th>فاتورة</th>
          <th>صرف</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each patientsList as patient (patient.id)}
        <tr class:filtered-out={!qRegex.test(patient.name!)}>
          <td>
            <a href="/patient/{patient.id}" class="btn pii">{patient.id}</a>
          </td>
          <td>
            <span class="patient-card">
              <span class="patient-name pii">
                {#if query}
                  {@html patient.name?.replaceAll(
                    qRegex,
                    (match) => `<mark>${match}</mark>`
                  )}
                {:else}
                  {patient.name}
                {/if}
              </span>

              <span class="patient-tags">
                {#if patient.nationality !== "EG"}
                  <span
                    class="nationality flag"
                    title={countryMap.get(patient.nationality)}
                  >
                    {getFlagEmoji(patient.nationality)}
                  </span>
                {/if}
                {#if patient.gender === false}
                  <span title="أنثى">
                    <Female color="pink" size="1em" />
                  </span>
                {/if}
                {#if patient.admission_notes?.includes("مسجون")}
                  <span title="مسجون">
                    <Inmate size="1em" />
                  </span>
                {/if}
                {#if patient.admission_notes?.includes("طالب")}
                  <span title="طالب">
                    <Student size="1em" />
                  </span>
                {/if}
              </span>
            </span>
          </td>
          <td>{patient.diagnosis}</td>
          <td>{formatDate(patient.admission_date, "YYYY/MM/DD")}</td>

          {#if isPharmacy}
            <td>
              <a href="/invoice/create/{patient.id}" class="btn invoice">فاتورة</a>
            </td>
            <td>
              <a href="/dispense/{patient.id}" class="btn dispense">صرف</a>
            </td>
          {/if}
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
  header {
    position: sticky;
    inset-block-start: 0;

    background-color: var(--main-bg-color);
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;

    z-index: 2;
  }

  ul.nav {
    position: fixed;
    inset-inline-end: -4px;
    inset-block: 50%;
    height: fit-content;
    background-color: var(--main-bg-color);
    box-shadow: var(--main-shadow);

    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    border: var(--main-border);
    border-radius: 4px;

    list-style: none;
    margin: 0;
    padding: 0.5rem 1rem;
    z-index: 3;

    a {
      color: var(--main-text-color);
      text-decoration: none;
    }

    hr {
      width: 100%;
      margin-block: 0.2rem;
    }
  }

  input[type="search"] {
    text-align: center;
    font-size: 1.5rem;
  }

  h2 {
    position: sticky;
    inset-block-start: var(--header-height);
    background-color: var(--main-bg-color);

    z-index: 1;

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
    scroll-margin-top: 150px;

    th,
    td {
      border: var(--main-border);
    }

    thead {
      position: sticky;
      inset-block-start: calc(var(--header-height) + 1.5rem);
    }

    tbody {
      tr {
        td {
          padding: 0.5rem 0.25rem;

          .patient-card:has(> .patient-tags > :first-child) {
            display: flex;
            justify-content: space-between;
            gap: 0.5rem;
          }

          .patient-tags:not(:has(> :first-child)) {
            display: none;
          }
        }

        &.filtered-out {
          display: none;
        }
      }
    }
  }

  .unregistered-patients {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-block-end: 1rem;
  }

  .ward-wrapper:last-of-type {
    margin-block-end: 2rem;
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
